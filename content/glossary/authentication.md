+++
title = "Authentication"
weight = 50
[extra]
tags = ["glossary", "authentication", "security", "identity", "jwt", "oauth2", "phoenix", "plug", "api-security", "session-management", "credential-verification", "access-control"]
description = "Process of verifying identity claims before granting system access, encompassing JWT tokens, API keys, session-based auth via Phoenix, and RBAC integration within the Prismatic Platform"
category = "security"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-advanced"
domain_category = "security-and-identity"
related_concepts = ["authorization", "rbac", "jwt", "oauth2", "credential-management", "encryption", "tls", "session-management"]
implementation_status = "production"
authority_level = "L3 Strategic"
difficulty_rating = 6
prerequisites = ["plug", "phoenix", "otp", "genserver"]
learning_path = ["authentication", "authorization", "rbac", "security-operations", "credential-management"]
interactive_demos = ["/labs/glossary/authentication"]
code_examples = ["Plug.Authentication", "Phoenix.Token", "Guardian.Pipeline", "APIAuth.Plug"]
external_resources = ["https://hexdocs.pm/phoenix/authentication.html", "https://hexdocs.pm/guardian/readme.html", "https://datatracker.ietf.org/doc/html/rfc7519"]
version_introduced = "0.1.0"
stability_level = "stable"
testing_scenarios = ["valid_credentials_grant_access", "invalid_credentials_deny_access", "expired_token_rejection", "api_key_rotation", "session_fixation_prevention", "brute_force_protection"]
keywords = ["authentication", "identity verification", "JWT", "API key", "session", "Phoenix auth", "Plug pipeline", "credential validation", "token refresh", "multi-factor"]
related_terms = ["authorization", "rbac", "jwt", "oauth2", "credential-management", "security-operations", "plug", "phoenix", "encryption", "tls"]
word_count = 1294
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Authentication - Prismatic Platform"
+++

## Definition

Authentication is the process of verifying that an entity (user, service, or agent) is who or what it claims to be. It answers the fundamental question "Who are you?" by validating presented credentials -- such as passwords, tokens, certificates, or API keys -- against a trusted identity store. Authentication is the prerequisite gate that must be passed before any [Authorization](@/glossary/authorization.md) decision can be made: you must first establish identity before determining permissions.

In the Prismatic Platform, authentication operates across multiple layers: HTTP request authentication via [Plug](@/glossary/plug.md) pipelines, WebSocket authentication for [Phoenix LiveView](@/glossary/phoenix-liveview.md) connections, inter-service authentication between umbrella applications, and AIAD agent authentication within the [authority structure](@/glossary/authority-structure.md).

## Overview

Authentication is one of the most critical security primitives in any distributed system. A failure in authentication undermines every other security measure -- if an attacker can impersonate a legitimate entity, authorization rules, audit logs, and access controls become meaningless. The Prismatic Platform treats authentication as a non-negotiable foundation, enforced through the [NO MERCY](@/glossary/no-mercy.md) doctrine: no unauthenticated request reaches application logic, no exception.

The platform employs a defense-in-depth authentication strategy:

1. **Transport-layer security** via [TLS](@/glossary/tls.md) ensures credentials cannot be intercepted in transit
2. **Token-based authentication** using [JWT](@/glossary/jwt.md) provides stateless verification for API consumers
3. **Session-based authentication** via [Phoenix](@/glossary/phoenix.md) encrypted cookies handles browser-based interactions
4. **API key authentication** enables machine-to-machine communication between services
5. **Agent authentication** validates AIAD agent identity before granting [authority level](@/glossary/authority-level.md) access

Each mechanism is selected based on the trust model, performance requirements, and client capabilities of the specific interaction pattern.

## Technical Details

### Authentication Factors

Authentication mechanisms are classified by the type of evidence (factor) they require:

| Factor Type | Description | Prismatic Usage | Strength |
|-------------|-------------|-----------------|----------|
| **Knowledge** | Something the entity knows | Passwords, PIN codes, shared secrets | Medium |
| **Possession** | Something the entity has | API keys, hardware tokens, signed certificates | High |
| **Inherence** | Something the entity is | Biometric data, behavioral patterns | Very High |
| **Token-based** | Cryptographically signed proof | JWT, OAuth2 access tokens, session tokens | High |
| **Certificate** | PKI-based identity proof | mTLS, client certificates | Very High |

### Authentication Protocols

The platform supports several authentication protocols, each suited to different interaction patterns:

| Protocol | Mechanism | Use Case | Statefulness |
|----------|-----------|----------|--------------|
| **JWT Bearer** | Signed JSON tokens in Authorization header | REST API, inter-service | Stateless |
| **Session Cookie** | Encrypted Phoenix session in cookie | Browser LiveView | Stateful (server-side) |
| **API Key** | Static key in header or query parameter | External integrations, CI/CD | Stateless |
| **OAuth2** | Delegated authorization with token exchange | Third-party integrations | Stateful (auth server) |
| **mTLS** | Mutual TLS certificate verification | Service mesh, high-security | Stateless |

### Token Lifecycle

JWT tokens in the Prismatic Platform follow a strict lifecycle:

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Issue    │───>│  Active   │───>│  Refresh  │───>│  Expire   │
│  (login)  │    │  (valid)  │    │  (near    │    │  (reject) │
│           │    │           │    │   expiry) │    │           │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     │                                                  │
     │              ┌──────────┐                        │
     └─────────────>│  Revoke   │<───────────────────────┘
                    │  (force)  │
                    └──────────┘
```

### Plug-Based Authentication Pipeline

Phoenix authentication in the Prismatic Platform is implemented as a composable [Plug](@/glossary/plug.md) pipeline:

```elixir
defmodule PrismaticWeb.Plugs.Authentication do
  @moduledoc """
  Composable authentication plug pipeline for the Prismatic Platform.

  Supports multiple authentication strategies (JWT, API key, session)
  with configurable fallback behavior. Each strategy is attempted in
  order; the first successful authentication wins.

  ## Configuration

      plug PrismaticWeb.Plugs.Authentication,
        strategies: [:jwt, :api_key, :session],
        required: true

  ## Strategies

  - `:jwt` - Validates Bearer token from Authorization header
  - `:api_key` - Validates X-API-Key header against key store
  - `:session` - Validates Phoenix session cookie
  """

  import Plug.Conn

  alias Prismatic.Auth.TokenVerifier
  alias Prismatic.Auth.APIKeyStore
  alias Prismatic.Auth.SessionManager

  @behaviour Plug

  @type strategy :: :jwt | :api_key | :session
  @type opts :: [strategies: [strategy()], required: boolean()]

  @spec init(opts()) :: opts()
  @impl true
  def init(opts) do
    strategies = Keyword.get(opts, :strategies, [:jwt, :session])
    required = Keyword.get(opts, :required, true)
    [strategies: strategies, required: required]
  end

  @spec call(Plug.Conn.t(), opts()) :: Plug.Conn.t()
  @impl true
  def call(conn, opts) do
    strategies = Keyword.fetch!(opts, :strategies)
    required = Keyword.fetch!(opts, :required)

    case authenticate_with_strategies(conn, strategies) do
      {:ok, conn, identity} ->
        conn
        |> assign(:current_identity, identity)
        |> assign(:authenticated, true)

      {:error, reason} when required ->
        conn
        |> put_status(:unauthorized)
        |> Phoenix.Controller.json(%{
          error: "authentication_required",
          message: "Valid credentials required",
          strategies: strategies
        })
        |> halt()

      {:error, _reason} ->
        assign(conn, :authenticated, false)
    end
  end

  @spec authenticate_with_strategies(Plug.Conn.t(), [strategy()]) ::
          {:ok, Plug.Conn.t(), map()} | {:error, atom()}
  defp authenticate_with_strategies(conn, strategies) do
    Enum.reduce_while(strategies, {:error, :no_credentials}, fn strategy, _acc ->
      case attempt_strategy(conn, strategy) do
        {:ok, conn, identity} -> {:halt, {:ok, conn, identity}}
        {:error, _reason} -> {:cont, {:error, :authentication_failed}}
      end
    end)
  end

  @spec attempt_strategy(Plug.Conn.t(), strategy()) ::
          {:ok, Plug.Conn.t(), map()} | {:error, atom()}
  defp attempt_strategy(conn, :jwt) do
    with ["Bearer " <> token] <- get_req_header(conn, "authorization"),
         {:ok, claims} <- TokenVerifier.verify_and_validate(token) do
      {:ok, conn, %{type: :jwt, claims: claims, subject: claims["sub"]}}
    else
      _ -> {:error, :invalid_jwt}
    end
  end

  defp attempt_strategy(conn, :api_key) do
    with [key] <- get_req_header(conn, "x-api-key"),
         {:ok, key_identity} <- APIKeyStore.validate(key) do
      {:ok, conn, %{type: :api_key, identity: key_identity}}
    else
      _ -> {:error, :invalid_api_key}
    end
  end

  defp attempt_strategy(conn, :session) do
    case get_session(conn, :user_id) do
      nil -> {:error, :no_session}
      user_id ->
        case SessionManager.validate_session(conn, user_id) do
          {:ok, session_data} ->
            {:ok, conn, %{type: :session, user_id: user_id, data: session_data}}
          {:error, reason} ->
            {:error, reason}
        end
    end
  end
end
```

### JWT Token Verification

```elixir
defmodule Prismatic.Auth.TokenVerifier do
  @moduledoc """
  JWT token verification with configurable signing algorithms,
  audience validation, and automatic key rotation support.

  Tokens are verified against the platform's JWKS (JSON Web Key Set)
  endpoint, with keys cached in ETS for performance.
  """

  alias Prismatic.Auth.KeyStore

  @type claims :: %{String.t() => term()}
  @type verification_error ::
          :expired | :invalid_signature | :invalid_audience | :malformed

  @spec verify_and_validate(String.t()) :: {:ok, claims()} | {:error, verification_error()}
  def verify_and_validate(token) when is_binary(token) do
    with {:ok, header} <- decode_header(token),
         {:ok, signing_key} <- KeyStore.get_key(header["kid"]),
         {:ok, claims} <- verify_signature(token, signing_key),
         :ok <- validate_expiration(claims),
         :ok <- validate_audience(claims),
         :ok <- validate_issuer(claims) do
      {:ok, claims}
    end
  end

  @spec decode_header(String.t()) :: {:ok, map()} | {:error, :malformed}
  defp decode_header(token) do
    case String.split(token, ".") do
      [header_b64, _payload, _signature] ->
        case Base.url_decode64(header_b64, padding: false) do
          {:ok, header_json} -> Jason.decode(header_json)
          :error -> {:error, :malformed}
        end

      _ ->
        {:error, :malformed}
    end
  end

  @spec validate_expiration(claims()) :: :ok | {:error, :expired}
  defp validate_expiration(%{"exp" => exp}) do
    now = System.system_time(:second)

    if now < exp do
      :ok
    else
      {:error, :expired}
    end
  end

  defp validate_expiration(_claims), do: {:error, :expired}

  @spec validate_audience(claims()) :: :ok | {:error, :invalid_audience}
  defp validate_audience(%{"aud" => aud}) do
    expected = Application.get_env(:prismatic, :jwt_audience, "prismatic-platform")

    if aud == expected or (is_list(aud) and expected in aud) do
      :ok
    else
      {:error, :invalid_audience}
    end
  end

  defp validate_audience(_claims), do: :ok

  @spec validate_issuer(claims()) :: :ok | {:error, :invalid_issuer}
  defp validate_issuer(%{"iss" => iss}) do
    allowed = Application.get_env(:prismatic, :jwt_issuers, ["prismatic"])

    if iss in allowed do
      :ok
    else
      {:error, :invalid_issuer}
    end
  end

  defp validate_issuer(_claims), do: :ok
end
```

### API Key Authentication

```elixir
defmodule Prismatic.Auth.APIKeyStore do
  @moduledoc """
  ETS-backed API key store with automatic rotation support,
  rate limiting per key, and audit logging of all key usage.
  """

  use GenServer

  @table_name :api_key_store

  @type key_identity :: %{
          key_id: String.t(),
          owner: String.t(),
          scopes: [String.t()],
          rate_limit: pos_integer(),
          created_at: DateTime.t()
        }

  @spec validate(String.t()) :: {:ok, key_identity()} | {:error, :invalid_key | :revoked}
  def validate(key) when is_binary(key) do
    hashed = hash_key(key)

    case :ets.lookup(@table_name, hashed) do
      [{^hashed, %{revoked: true}}] ->
        {:error, :revoked}

      [{^hashed, identity}] ->
        :telemetry.execute(
          [:prismatic, :auth, :api_key, :validated],
          %{count: 1},
          %{key_id: identity.key_id, owner: identity.owner}
        )
        {:ok, identity}

      [] ->
        {:error, :invalid_key}
    end
  end

  @spec hash_key(String.t()) :: binary()
  defp hash_key(key), do: :crypto.hash(:sha256, key)
end
```

### Authentication Telemetry Events

The platform emits telemetry events for all authentication operations:

| Event | Measurements | Metadata |
|-------|-------------|----------|
| `[:prismatic, :auth, :attempt]` | `%{count: 1}` | `%{strategy: atom, success: boolean}` |
| `[:prismatic, :auth, :success]` | `%{duration: integer}` | `%{strategy: atom, identity_type: atom}` |
| `[:prismatic, :auth, :failure]` | `%{count: 1}` | `%{strategy: atom, reason: atom}` |
| `[:prismatic, :auth, :token_refresh]` | `%{count: 1}` | `%{subject: string}` |
| `[:prismatic, :auth, :api_key, :validated]` | `%{count: 1}` | `%{key_id: string, owner: string}` |

## Implementation in Prismatic Platform

Authentication in the Prismatic Platform is implemented across several layers of the umbrella architecture:

### Router-Level Pipeline Configuration

The Phoenix router defines authentication pipelines that apply to different route scopes:

```elixir
defmodule PrismaticWeb.Router do
  use PrismaticWeb, :router

  pipeline :browser_auth do
    plug :fetch_session
    plug :fetch_live_flash
    plug PrismaticWeb.Plugs.Authentication, strategies: [:session]
  end

  pipeline :api_auth do
    plug PrismaticWeb.Plugs.Authentication,
      strategies: [:jwt, :api_key],
      required: true
  end

  pipeline :agent_auth do
    plug PrismaticWeb.Plugs.AgentAuthentication,
      verify_authority_level: true
  end

  scope "/api/v1", PrismaticAPI do
    pipe_through [:api, :api_auth]
    # All API routes require JWT or API key
  end

  scope "/", PrismaticWeb do
    pipe_through [:browser, :browser_auth]
    # Browser routes use session authentication
  end
end
```

### LiveView Socket Authentication

LiveView connections require authentication at the socket level:

```elixir
defmodule PrismaticWeb.UserSocket do
  use Phoenix.Socket

  @spec connect(map(), Phoenix.Socket.t(), connect_info :: map()) ::
          {:ok, Phoenix.Socket.t()} | {:error, atom()}
  @impl true
  def connect(%{"token" => token}, socket, _connect_info) do
    case Prismatic.Auth.TokenVerifier.verify_and_validate(token) do
      {:ok, claims} ->
        {:ok, assign(socket, :current_user, claims["sub"])}

      {:error, _reason} ->
        {:error, :unauthorized}
    end
  end

  def connect(_params, _socket, _connect_info), do: {:error, :missing_token}
end
```

### AIAD Agent Authentication

Agents within the [AIAD](@/glossary/aiad.md) framework authenticate using a separate mechanism tied to their [authority level](@/glossary/authority-level.md):

```elixir
defmodule Prismatic.AIAD.AgentAuth do
  @moduledoc """
  Authenticates AIAD agents and verifies their authority level
  before allowing operations. Agent identity is established
  through signed agent manifests.
  """

  @spec authenticate_agent(String.t(), map()) ::
          {:ok, %{agent_id: String.t(), authority: atom()}} | {:error, atom()}
  def authenticate_agent(agent_id, credentials) do
    with {:ok, manifest} <- load_agent_manifest(agent_id),
         :ok <- verify_manifest_signature(manifest, credentials),
         {:ok, authority} <- resolve_authority_level(manifest) do
      {:ok, %{agent_id: agent_id, authority: authority}}
    end
  end
end
```

## Comparison with Alternatives

| Approach | Stateless | Scalability | Revocation | Complexity | Prismatic Usage |
|----------|-----------|-------------|------------|------------|-----------------|
| **JWT Bearer** | Yes | Excellent | Difficult (needs blocklist) | Medium | Primary API auth |
| **Session Cookie** | No | Good (sticky sessions) | Immediate | Low | Browser LiveView |
| **API Key** | Yes | Excellent | Immediate (key store) | Low | Machine-to-machine |
| **OAuth2 + OIDC** | Hybrid | Excellent | Via token revocation | High | Third-party integration |
| **mTLS** | Yes | Excellent | Via CRL/OCSP | Very High | Service mesh (future) |
| **SAML** | No | Good | Session-based | Very High | Enterprise SSO (future) |
| **Basic Auth** | Yes | Excellent | N/A (per-request) | Very Low | Not used (insecure) |

The Prismatic Platform avoids Basic Auth entirely due to credential exposure risk, and prefers JWT for API authentication because it enables stateless verification without database lookups on every request -- critical for the platform's performance targets of under 250ms page load times.

## Best Practices

1. **Always authenticate at the boundary**: Authentication plugs must be the first security check in any pipeline. Never allow unauthenticated requests to reach business logic.

2. **Use short-lived tokens with refresh**: JWT access tokens should expire in 15-30 minutes. Use refresh tokens (stored server-side) for longer sessions.

3. **Hash API keys before storage**: Never store raw API keys. Use SHA-256 or bcrypt hashing so that a database breach does not expose usable credentials.

4. **Emit telemetry for all auth events**: Every authentication attempt, success, and failure should emit telemetry events for monitoring and anomaly detection.

5. **Implement rate limiting on auth endpoints**: Brute-force protection requires rate limiting on login, token refresh, and API key validation endpoints.

6. **Validate all token claims**: Never trust a JWT without verifying signature, expiration, audience, and issuer. Missing any validation is a security vulnerability.

7. **Separate authentication from authorization**: Authentication establishes identity; [authorization](@/glossary/authorization.md) determines permissions. Keep these concerns in separate modules with clear interfaces.

8. **Rotate secrets regularly**: JWT signing keys, API keys, and session secrets should be rotated on a schedule. Support key overlap periods for zero-downtime rotation.

## Common Pitfalls

1. **Confusing authentication with authorization**: Verifying identity (authentication) does not grant permissions. A valid JWT proves who you are, not what you can do. Always pair with [RBAC](@/glossary/rbac.md) checks.

2. **Storing JWT tokens in localStorage**: Browser localStorage is accessible to XSS attacks. Use HttpOnly, Secure, SameSite cookies for browser-based token storage.

3. **Not validating token expiration**: Accepting expired tokens defeats the purpose of short-lived credentials. Always check the `exp` claim server-side.

4. **Hardcoding secrets in source code**: API keys, JWT secrets, and encryption keys must come from environment variables or a secrets manager, never from source code.

5. **Missing logout/revocation mechanism**: Stateless JWTs cannot be "logged out" without a server-side blocklist or short expiration. Plan your revocation strategy before choosing token types.

6. **Ignoring timing attacks**: String comparison of tokens or passwords must use constant-time comparison functions (`Plug.Crypto.secure_compare/2`) to prevent timing-based credential extraction.

7. **Single point of failure in auth service**: If the authentication service goes down, the entire platform becomes inaccessible. Use cached JWKS keys and graceful degradation strategies.

## Use Cases

### REST API Consumer Authentication

External clients authenticate to the Prismatic API using JWT bearer tokens obtained via [OAuth2](@/glossary/oauth2.md) token exchange. The stateless nature of JWT verification means API gateway nodes do not need shared session state, enabling horizontal scaling.

### LiveView Dashboard Authentication

The Prismatic Web dashboard uses Phoenix session-based authentication with encrypted cookies. This provides immediate revocation (clear the session) and seamless integration with LiveView's persistent WebSocket connections.

### Inter-Service Authentication

Umbrella applications within the Prismatic Platform authenticate to each other using service-specific API keys with scoped permissions. This prevents a compromised service from accessing resources outside its domain.

### AIAD Agent Authentication

Autonomous agents authenticate through signed manifests that cryptographically prove their identity and [authority level](@/glossary/authority-level.md). This prevents unauthorized agents from executing privileged operations.

### CI/CD Pipeline Authentication

Deployment pipelines authenticate to the platform using short-lived, scoped API keys that are automatically rotated per deployment. This limits the blast radius of any credential compromise.

## Related Concepts

- [Authorization](@/glossary/authorization.md) -- determining permissions after identity is established
- [RBAC](@/glossary/rbac.md) -- role-based access control for permission management
- [JWT](@/glossary/jwt.md) -- JSON Web Tokens for stateless authentication
- [OAuth2](@/glossary/oauth2.md) -- delegated authorization framework
- [Credential Management](@/glossary/credential-management.md) -- lifecycle management of authentication credentials
- [Security Operations](@/glossary/security-operations.md) -- monitoring and incident response for security events
- [Plug](@/glossary/plug.md) -- composable request processing pipeline
- [Phoenix](@/glossary/phoenix.md) -- web framework providing authentication infrastructure
- [TLS](@/glossary/tls.md) -- transport-layer encryption protecting credentials in transit
- [Encryption](@/glossary/encryption.md) -- cryptographic primitives underlying authentication mechanisms
- [Authority Level](@/glossary/authority-level.md) -- hierarchical access classification for AIAD agents
- [AIAD](@/glossary/aiad.md) -- agent framework with built-in authentication requirements

## See Also

- [Phoenix Authentication Guide](https://hexdocs.pm/phoenix/authentication.html) -- official Phoenix authentication documentation
- [RFC 7519: JSON Web Token](https://datatracker.ietf.org/doc/html/rfc7519) -- JWT specification
- [RFC 6749: OAuth 2.0 Authorization Framework](https://datatracker.ietf.org/doc/html/rfc6749) -- OAuth2 specification
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) -- security best practices
- Glossary Index -- complete glossary of Prismatic Platform terminology

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
