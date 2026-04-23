+++
title = "JWT"
weight = 42
[extra]
category = "security"
description = "JSON Web Token standard for compact, self-contained authentication and authorization claims"
related_terms = ["oauth2", "rest-api", "api-gateway", "rbac", "encryption-at-rest", "tls", "plug"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1256
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["JWT", "JSON", "Token", "glossary", "security", "Prismatic Platform", "JWTs", "HMAC"]
tags = ["glossary", "security", "jwt", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "JWT - Prismatic Platform"
+++

## Definition

JSON Web Token (JWT, pronounced "jot") is an open standard defined in RFC 7519 for creating compact, URL-safe tokens that carry claims between parties. A JWT consists of three Base64url-encoded parts separated by dots: a header specifying the signing algorithm and token type, a payload containing the claims (assertions about an entity and additional metadata), and a signature that cryptographically verifies the token's integrity and authenticity. The self-contained nature of JWTs means that all information needed to validate the token and make authorization decisions is embedded within the token itself.

JWTs enable stateless authentication because the server can validate the token using only a cryptographic key, without consulting a session store or database. This property is particularly valuable in distributed systems and microservice architectures where maintaining centralized session state would create a bottleneck and single point of failure. A valid JWT carries the complete authorization context -- user identity, roles, permissions, expiration -- in a portable, verifiable package.

The JWT ecosystem includes two related specifications: JSON Web Signature (JWS, RFC 7515) for signed tokens that provide integrity and authenticity, and JSON Web Encryption (JWE, RFC 7516) for encrypted tokens that additionally provide confidentiality. Most practical JWT deployments use JWS, where the payload is readable by anyone but cannot be modified without invalidating the signature. JWE is used when the claims themselves contain sensitive information that must be hidden from intermediaries.

## Token Structure

A JWT is composed of three parts, each Base64url-encoded and concatenated with dots:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyOjQyIiwicm9sZXMiOlsiYW5hbHlzdCJdLCJleHAiOjE3MDY3NDU2MDB9.HMAC_SHA256_SIGNATURE
|___________________________________|.|___________________________________________________________________________________|.|__________________________|
             Header                                                     Payload                                                    Signature
```

| Part | Content | Encoding | Purpose |
|------|---------|----------|---------|
| **Header** | `{"alg": "HS256", "typ": "JWT"}` | Base64url | Identifies signing algorithm and token type |
| **Payload** | `{"sub": "user:42", "roles": ["analyst"], "exp": 1706745600}` | Base64url | Carries claims about the subject |
| **Signature** | `HMAC-SHA256(base64url(header) + "." + base64url(payload), secret)` | Base64url | Verifies integrity and authenticity |

The header and payload are not encrypted -- they are merely encoded. Anyone who possesses the token can decode and read the claims. The signature ensures that the claims have not been tampered with, but it does not hide them. For this reason, JWTs should never contain sensitive data (passwords, API keys) unless JWE encryption is applied.

## Registered Claims

RFC 7519 defines a set of registered claim names with standardized semantics. While all claims are optional, certain claims are essential for secure JWT deployment:

| Claim | Name | Type | Description | Prismatic Usage |
|-------|------|------|-------------|-----------------|
| `iss` | Issuer | String | Entity that issued the token | `"prismatic-platform"` |
| `sub` | Subject | String | Entity the token describes | `"user:42"` or `"agent:archer"` |
| `aud` | Audience | String/Array | Intended recipient(s) | `"prismatic-api"` |
| `exp` | Expiration | NumericDate | Token expiration timestamp | Unix timestamp, typically +1 hour |
| `nbf` | Not Before | NumericDate | Token not valid before this time | Used for scheduled token activation |
| `iat` | Issued At | NumericDate | Token creation timestamp | Automatic, used for age calculations |
| `jti` | JWT ID | String | Unique token identifier | UUID, used for revocation list |

Beyond registered claims, Prismatic extends the payload with private claims for [RBAC](@/glossary/rbac.md) enforcement:

```json
{
  "iss": "prismatic-platform",
  "sub": "user:42",
  "aud": "prismatic-api",
  "exp": 1706745600,
  "iat": 1706742000,
  "jti": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "roles": ["analyst", "viewer"],
  "permissions": ["assets:read:all", "reports:read:team"],
  "team": "blue-team",
  "provider": "github"
}
```

## Signing Algorithms

The choice of signing algorithm determines the security properties, key management requirements, and performance characteristics of JWT verification:

| Algorithm | Type | Key | Performance | Use Case |
|-----------|------|-----|-------------|----------|
| **HS256** | Symmetric (HMAC) | Shared secret | Fast | Single-service, internal APIs |
| **HS384** | Symmetric (HMAC) | Shared secret | Fast | Higher security HMAC |
| **HS512** | Symmetric (HMAC) | Shared secret | Fast | Maximum HMAC security |
| **RS256** | Asymmetric (RSA) | Public/private key pair | Slower | Multi-service, federated identity |
| **RS512** | Asymmetric (RSA) | Public/private key pair | Slower | High-security RSA |
| **ES256** | Asymmetric (ECDSA) | Public/private key pair | Medium | Modern alternative to RSA, smaller keys |
| **EdDSA** | Asymmetric (EdDSA) | Public/private key pair | Fast | State-of-the-art, Ed25519 curves |

**Symmetric algorithms** (HS*) use a single shared secret for both signing and verification. They are fast but require distributing the secret to every service that needs to verify tokens -- a security liability in distributed systems.

**Asymmetric algorithms** (RS*, ES*, EdDSA) use a private key for signing and a public key for verification. Only the authentication service holds the private key; all other services verify tokens with the public key. This is the recommended approach for multi-service architectures.

```elixir
# Guardian configuration with asymmetric signing
# config/config.exs
config :prismatic_web, PrismaticWeb.Guardian,
  issuer: "prismatic-platform",
  secret_key: {PrismaticWeb.Guardian, :fetch_secret_key, []},
  allowed_algos: ["RS256"],
  verify_issuer: true,
  ttl: {1, :hour}

defmodule PrismaticWeb.Guardian do
  use Guardian, otp_app: :prismatic_web

  def fetch_secret_key do
    # Load RSA private key from secure storage
    case Application.get_env(:prismatic_web, :jwt_private_key_path) do
      nil -> {:error, :missing_key_path}
      path -> JOSE.JWK.from_pem_file(path)
    end
  end

  def subject_for_token(%User{id: id}, _claims), do: {:ok, "user:#{id}"}
  def subject_for_token(%Agent{id: id}, _claims), do: {:ok, "agent:#{id}"}
  def subject_for_token(_, _), do: {:error, :invalid_subject}

  def resource_from_claims(%{"sub" => "user:" <> id}), do: {:ok, Accounts.get_user!(id)}
  def resource_from_claims(%{"sub" => "agent:" <> id}), do: {:ok, Agents.get_agent!(id)}
  def resource_from_claims(_), do: {:error, :invalid_claims}
end
```

## Token Refresh Mechanism

Access tokens are intentionally short-lived to limit the window of exposure if compromised. The token refresh mechanism allows clients to obtain new access tokens without requiring the user to re-authenticate:

| Token Type | Lifetime | Storage | Revocable | Purpose |
|-----------|----------|---------|-----------|---------|
| **Access Token** | 15 min - 1 hour | Client memory (never localStorage) | Via revocation list | API authentication |
| **Refresh Token** | 1 day - 30 days | Server-side (encrypted) | Direct database deletion | Access token renewal |

The refresh flow works as follows:

1. Client detects that the access token is expired or about to expire (checking `exp` claim)
2. Client sends the refresh token to the token endpoint
3. Server validates the refresh token, checks revocation status, and verifies the associated user still has active permissions
4. Server issues a new access token (and optionally a new refresh token, implementing token rotation)
5. Old refresh token is invalidated (rotation) to prevent replay attacks

Proactive refresh -- requesting a new token before expiration, typically 5 minutes before `exp` -- provides a seamless user experience without authentication interruptions.

## Context in Prismatic

The Prismatic Platform uses JWT as the primary authentication mechanism for both human users and AI agents. The `PrismaticWeb.Plugs.APIAuth` plug validates JWTs on every incoming request, extracting claims for [RBAC](@/glossary/rbac.md) enforcement without database lookups. The [API Gateway](@/glossary/api-gateway.md) serves as the single validation point, ensuring consistent token verification across all backend services.

Token issuance occurs through two paths: direct authentication (username/password with MFA) produces a JWT with full user claims, while [OAuth2](@/glossary/oauth2.md) provider authentication (GitHub, Google, GitLab) produces a JWT after successful callback processing. Both paths result in identical JWT structures, making downstream authorization agnostic to the authentication method.

For agent-to-agent communication within the platform, JWTs carry [agent tier](@/glossary/agent-tier.md) claims (L1 through L5) alongside standard role claims. This enables the AIAD authority model to function as a JWT-verified permission hierarchy, where higher-tier agents can issue commands to lower-tier agents by presenting tokens with superior authority claims.

```elixir
# JWT validation plug pipeline
defmodule PrismaticWeb.Router do
  use PrismaticWeb, :router

  pipeline :api_authenticated do
    plug PrismaticWeb.Plugs.APIAuth
    plug PrismaticWeb.Plugs.RequireRole, minimum: :viewer
    plug PrismaticWeb.Plugs.RateLimiter, by: :token_sub
  end

  scope "/api/v1", PrismaticWeb.API do
    pipe_through [:api, :api_authenticated]

    get "/assets", AssetController, :index
    get "/reports", ReportController, :index
    post "/scans", ScanController, :create
  end
end
```

## Security Best Practices

| Practice | Description | Enforcement |
|----------|-------------|-------------|
| **Always verify signature** | Never trust payload without cryptographic verification | Automatic in Guardian |
| **Validate all claims** | Check `exp`, `iss`, `aud`, `nbf` on every request | Guardian configuration |
| **Use asymmetric signing** | RS256/ES256 for multi-service architectures | Platform default |
| **Short access token TTL** | 15-60 minute lifetimes limit compromise window | 1 hour default |
| **Secure token storage** | HttpOnly cookies or memory-only; never localStorage | Server-side sessions |
| **Implement revocation** | Maintain a revocation list for emergency token invalidation | ETS-backed revocation cache |
| **Rotate refresh tokens** | Issue new refresh token on each use, invalidate the old one | Rotation on refresh |
| **No sensitive data in payload** | JWS payloads are readable by anyone with the token | Code review enforcement |
| **Use `jti` for uniqueness** | Prevents token replay across different contexts | UUID generation on issuance |
| **Transport over TLS only** | Tokens in transit must be encrypted at the transport layer | HTTPS enforced at gateway |

## Common Vulnerabilities

| Vulnerability | Attack | Prevention |
|--------------|--------|------------|
| **Algorithm confusion** | Attacker changes `alg` to `none` or switches RSA to HMAC | Explicitly whitelist allowed algorithms |
| **Key confusion (RS/HS)** | Using public RSA key as HMAC secret | Enforce algorithm-key type matching |
| **Token replay** | Stolen token reused after user intent | Short TTL + `jti` claim + revocation |
| **Payload tampering** | Modified claims without re-signing | Always verify signature before reading claims |
| **Cross-service token reuse** | Token for Service A used on Service B | Validate `aud` claim per service |
| **Expired token acceptance** | Clock skew allows expired tokens | Maximum 30-second clock tolerance |

## Related Terms

- [OAuth2](@/glossary/oauth2.md) - Authorization framework that issues JWTs as access tokens
- [RBAC](@/glossary/rbac.md) - Role-based access control with roles carried in JWT claims
- [REST API](@/glossary/rest-api.md) - Stateless HTTP interface authenticated with JWTs
- [API Gateway](@/glossary/api-gateway.md) - Entry point validating JWT tokens for all backend services
- [TLS](@/glossary/tls.md) - Transport encryption protecting JWT tokens in transit
- [Encryption at Rest](@/glossary/encryption-at-rest.md) - Protection of stored refresh tokens and signing keys
- [Plug](@/glossary/plug.md) - Elixir middleware executing JWT validation in request pipeline
- [Agent Tier](@/glossary/agent-tier.md) - Agent authority claims embedded in JWTs
- [Rate Limiting](@/glossary/rate-limiting.md) - Per-token throttling using JWT `sub` claim
- [Observability](@/glossary/observability.md) - Monitoring JWT validation failures and token metrics

## See Also

- [Architecture](@/architecture/_index.md) - Security architecture and token flow
- [Apps](@/apps/_index.md) - Prismatic API and Web authentication
- [Technologies](@/technologies/_index.md) - Guardian, JOSE, and cryptographic libraries

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)