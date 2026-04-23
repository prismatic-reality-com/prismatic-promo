+++
title = "OAuth2"
weight = 43
[extra]
category = "security"
description = "Authorization framework enabling secure delegated access to resources without sharing credentials"
related_terms = ["jwt", "rbac", "rest-api", "api-gateway", "tls", "plug"]
complexity_level = "advanced"
security_protocol = true
authorization_framework = true
rfc_specification = "6749"
industry_standard = true
delegated_access = true
token_based = true
scope_support = true
pkce_support = true
grant_types = 7
deprecated_grants = 2
secure_grants = 5
client_types = ["confidential", "public"]
flow_types = ["authorization_code", "client_credentials", "device_code", "refresh_token"]
openid_connect_compatible = true
platform_integration = "native"
umbrella_apps = ["prismatic_web", "prismatic_api", "prismatic_auth"]
threat_model = "comprehensive"
credential_isolation = true
limited_scope = true
time_bounded = true
revocation_support = true
introspection_support = true
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1180
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["OAuth2", "Authorization", "glossary", "security", "Prismatic Platform", "Token", "PKCE"]
tags = ["glossary", "security", "oauth2", "prismatic"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "OAuth2 - Prismatic Platform"
+++

## Definition

OAuth 2.0 is an authorization framework defined in RFC 6749 that enables applications to obtain limited access to user accounts on third-party services without exposing user credentials. Rather than sharing passwords between applications, OAuth2 defines a series of authorization flows -- called grant types -- that issue scoped access tokens representing specific permissions. The requesting application receives a token that grants only the access it needs, for a limited time, without ever seeing the user's actual credentials.

OAuth2 draws a sharp distinction between authentication (proving who you are) and authorization (proving what you are allowed to do). While OAuth2 is strictly an authorization protocol, it is frequently extended with OpenID Connect (OIDC) to provide authentication capabilities as well. This layered design allows systems to compose authentication and authorization independently, choosing the right mechanism for each concern.

The protocol has become the de facto standard for API authorization across the industry, used by virtually every major platform including Google, GitHub, Microsoft, and Facebook. Its widespread adoption means that integrating third-party services almost always involves implementing an OAuth2 flow, making it essential knowledge for any platform that consumes or exposes APIs.

## Grant Types

OAuth2 defines several grant types, each designed for a specific use case and threat model. The choice of grant type depends on the client type (confidential vs. public), the deployment context (server-side vs. mobile vs. SPA), and the trust relationship between parties.

| Grant Type | RFC | Client Type | Use Case | Security Level |
|-----------|-----|-------------|----------|----------------|
| **Authorization Code** | RFC 6749 | Confidential | Server-side web applications | High |
| **Authorization Code + PKCE** | RFC 7636 | Public | Mobile apps, SPAs, CLIs | High |
| **Client Credentials** | RFC 6749 | Confidential | Service-to-service (M2M) | High |
| **Device Code** | RFC 8628 | Public | Input-constrained devices (smart TV, CLI) | Medium |
| **Refresh Token** | RFC 6749 | Both | Token renewal without re-authentication | High |
| ~~Implicit~~ | RFC 6749 | Public | ~~Browser-based apps~~ **DEPRECATED** | Low |
| ~~Resource Owner Password~~ | RFC 6749 | Confidential | ~~Legacy migration~~ **DEPRECATED** | Low |

The implicit and resource owner password grants are formally deprecated in the OAuth 2.1 draft (draft-ietf-oauth-v2-1) due to inherent security weaknesses. Modern applications should use Authorization Code with PKCE for all public client scenarios.

## Authorization Code Flow

The authorization code flow is the most common and most secure OAuth2 grant type for user-facing applications. It involves a three-party exchange between the user's browser, the authorization server, and the client application:

```
+--------+                               +---------------+
|        |--(1) Authorization Request --->|               |
|        |                                | Authorization |
| User   |<-(2) Authorization Grant ------|    Server     |
| Agent  |                                |               |
|        |                                +---------------+
+--------+                                       |
    |                                             |
    v                                             |
+--------+                                        |
|        |--(3) Authorization Code + Verifier ---->|
| Client |                                        |
|        |<-(4) Access Token + Refresh Token ------|
|        |                                        |
|        |--(5) API Request + Access Token ------->+---------------+
|        |                                        |   Resource    |
|        |<-(6) Protected Resource ---------------|    Server     |
+--------+                                        +---------------+
```

The critical security property is that the access token is never exposed to the user agent (browser). The authorization code is exchanged server-side, where the client secret (or PKCE verifier) proves the client's identity.

## PKCE Extension

Proof Key for Code Exchange (PKCE, pronounced "pixy") was introduced in RFC 7636 to protect the authorization code flow against interception attacks, particularly on mobile platforms where custom URL schemes can be intercepted by malicious applications.

```elixir
# PKCE implementation in Elixir
defmodule PrismaticAuth.PKCE do
  @doc "Generate a cryptographically random code verifier"
  @spec generate_verifier() :: String.t()
  def generate_verifier do
    :crypto.strong_rand_bytes(32)
    |> Base.url_encode64(padding: false)
  end

  @doc "Derive the code challenge from the verifier using S256"
  @spec generate_challenge(String.t()) :: String.t()
  def generate_challenge(verifier) do
    :crypto.hash(:sha256, verifier)
    |> Base.url_encode64(padding: false)
  end

  @doc "Verify a code verifier against a stored challenge"
  @spec verify(String.t(), String.t()) :: boolean()
  def verify(verifier, stored_challenge) do
    generate_challenge(verifier) == stored_challenge
  end
end
```

PKCE works by having the client generate a random `code_verifier`, derive a `code_challenge` from it (SHA-256 hash), send the challenge with the authorization request, and later prove possession of the verifier when exchanging the code for a token. Even if the authorization code is intercepted, the attacker cannot exchange it without the original verifier.

## Token Lifecycle

OAuth2 tokens follow a defined lifecycle from issuance through expiration or revocation:

| Phase | Description | Typical Duration |
|-------|-------------|-----------------|
| **Issuance** | Token generated after successful grant exchange | Instantaneous |
| **Active** | Token valid for API requests within scope | 15 min - 1 hour |
| **Refresh** | New access token obtained using refresh token | Seconds |
| **Expiration** | Token becomes invalid after `exp` timestamp | Automatic |
| **Revocation** | Token explicitly invalidated before expiration (RFC 7009) | Immediate |

Access tokens are intentionally short-lived (typically 15-60 minutes) to limit the damage window if a token is compromised. Refresh tokens have longer lifetimes (hours to days) but are stored securely server-side and can be individually revoked.

```elixir
# Token lifecycle management
defmodule PrismaticAuth.TokenManager do
  @access_token_ttl 3600       # 1 hour
  @refresh_token_ttl 604_800   # 7 days

  @spec issue_tokens(User.t(), list(String.t())) ::
    {:ok, %{access_token: String.t(), refresh_token: String.t()}}
  def issue_tokens(user, scopes) do
    access_token = Guardian.encode_and_sign(user, %{
      scopes: scopes,
      roles: user.roles,
      typ: "access"
    }, ttl: {@access_token_ttl, :second})

    refresh_token = Guardian.encode_and_sign(user, %{
      typ: "refresh"
    }, ttl: {@refresh_token_ttl, :second})

    {:ok, %{access_token: access_token, refresh_token: refresh_token}}
  end

  @spec refresh(String.t()) :: {:ok, String.t()} | {:error, :invalid_token}
  def refresh(refresh_token) do
    case Guardian.decode_and_verify(refresh_token, %{"typ" => "refresh"}) do
      {:ok, claims} -> issue_access_token(claims["sub"])
      {:error, _reason} -> {:error, :invalid_token}
    end
  end
end
```

## Scopes and Permission Mapping

OAuth2 scopes define the boundaries of access that a token grants. Scopes are strings that represent specific capabilities, and they map to the platform's [RBAC](@/glossary/rbac.md) permission model:

| OAuth2 Scope | RBAC Permission | Description |
|-------------|-----------------|-------------|
| `assets:read` | Viewer role | Read asset inventory |
| `assets:write` | Operator role | Create and modify assets |
| `scans:execute` | Operator role | Execute OSINT/EASM scans |
| `reports:read` | Analyst role | Access security reports |
| `compliance:assess` | Analyst role | Run compliance assessments |
| `admin:manage` | Admin role | System administration |

Scope validation occurs at two points: when the token is issued (ensuring the requested scopes are within the user's authorized set) and when the token is used (ensuring the requested operation falls within the token's granted scopes). This double-check prevents both scope escalation and scope drift.

## Context in Prismatic

The Prismatic Platform supports OAuth2 for third-party integrations and API access delegation. External services accessing Prismatic API endpoints authenticate through the client credentials flow, receiving [JWT](@/glossary/jwt.md) access tokens with scoped permissions. The [RBAC](@/glossary/rbac.md) system maps OAuth2 scopes to platform roles, ensuring that delegated access respects the same permission boundaries as direct authentication.

For user-facing authentication, the platform integrates with the [Ueberauth](https://hex.pm/packages/ueberauth) library, which provides a composable, strategy-based approach to OAuth2 authentication with external providers. Each provider (GitHub, Google, GitLab) is configured as a separate Ueberauth strategy, and successful authentication results in a platform [JWT](@/glossary/jwt.md) being issued with the appropriate role claims.

The [API Gateway](@/glossary/api-gateway.md) validates all incoming tokens through [Plug](@/glossary/plug.md) middleware, checking token signature, expiration, and scope before routing to backend services. All token exchange occurs over [TLS](@/glossary/tls.md) to prevent interception.

```elixir
# Ueberauth configuration for OAuth2 providers
# config/config.exs
config :ueberauth, Ueberauth,
  providers: [
    github: {Ueberauth.Strategy.Github, [default_scope: "user:email,read:org"]},
    google: {Ueberauth.Strategy.Google, [default_scope: "email profile"]},
    gitlab: {Ueberauth.Strategy.Gitlab, [default_scope: "read_user openid"]}
  ]

# OAuth2 callback controller
defmodule PrismaticWeb.AuthController do
  use PrismaticWeb, :controller

  def callback(%{assigns: %{ueberauth_auth: auth}} = conn, _params) do
    user_params = %{
      email: auth.info.email,
      provider: to_string(auth.provider),
      provider_uid: auth.uid
    }

    case Accounts.find_or_create_user(user_params) do
      {:ok, user} ->
        {:ok, token, _claims} = Guardian.encode_and_sign(user)
        json(conn, %{access_token: token})

      {:error, reason} ->
        conn |> put_status(:unauthorized) |> json(%{error: reason})
    end
  end
end
```

## Security Considerations

OAuth2 implementations must address several security concerns to prevent token theft, replay attacks, and privilege escalation:

| Threat | Mitigation | Prismatic Implementation |
|--------|-----------|-------------------------|
| **Authorization code interception** | PKCE (RFC 7636) | Mandatory for all public clients |
| **Token theft via XSS** | HttpOnly, Secure, SameSite cookies | Tokens stored server-side, not in localStorage |
| **Redirect URI manipulation** | Exact URI matching (no wildcards) | Strict redirect URI validation |
| **Token replay** | Short TTL + refresh tokens | 1-hour access tokens, 7-day refresh |
| **Scope escalation** | Server-side scope validation | Double-check at issuance and usage |
| **CSRF on authorization endpoint** | `state` parameter with HMAC | Mandatory for all flows |
| **Refresh token theft** | Token rotation (RFC 6819) | New refresh token on each use |

All OAuth2 token exchange MUST occur over [TLS](@/glossary/tls.md). The Prismatic Platform enforces HTTPS for all OAuth2 endpoints and rejects plain HTTP requests at the [API Gateway](@/glossary/api-gateway.md) level.

## OAuth 2.1 and Future Direction

The OAuth 2.1 draft specification (draft-ietf-oauth-v2-1) consolidates OAuth 2.0, its extensions, and current best practices into a single document. Key changes include:

- **PKCE required** for all authorization code grants (not just public clients)
- **Implicit grant removed** entirely
- **Resource Owner Password grant removed** entirely
- **Redirect URI exact matching** mandatory (no pattern matching)
- **Refresh token rotation** recommended for all clients
- **Bearer token usage** consolidated from RFC 6750

These changes align with what the Prismatic Platform already enforces, as the platform was designed with OAuth 2.1 best practices from the start.

## Related Terms

- [JWT](@/glossary/jwt.md) - Token format commonly used for OAuth2 access tokens
- [RBAC](@/glossary/rbac.md) - Permission model mapping OAuth2 scopes to platform roles
- [REST API](@/glossary/rest-api.md) - API interface secured with OAuth2 tokens
- [TLS](@/glossary/tls.md) - Transport encryption protecting OAuth2 token exchange
- [API Gateway](@/glossary/api-gateway.md) - Centralized token validation and routing
- [Plug](@/glossary/plug.md) - Elixir middleware implementing OAuth2 validation
- [Rate Limiting](@/glossary/rate-limiting.md) - Per-client throttling using OAuth2 client identity
- [Encryption at Rest](@/glossary/encryption-at-rest.md) - Protection of stored refresh tokens and client secrets
- [Observability](@/glossary/observability.md) - Monitoring OAuth2 flows and token usage
- [OpenAPI](@/glossary/openapi.md) - API specification documenting OAuth2 security schemes

## See Also

- [Architecture](@/architecture/_index.md) - Authentication architecture
- [Apps](@/apps/_index.md) - Prismatic API application with OAuth2 support
- [Agents](@/agents/_index.md) - Agent authentication and authorization

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)