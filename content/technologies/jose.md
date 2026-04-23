+++
title = "JOSE"
weight = 80
[extra]
category = "security"
description = "JSON Object Signing and Encryption library for JWT token generation, verification, and cryptographic operations"
url = "https://hexdocs.pm/jose/"
version = "1.11+"
icon = "jose"
color = "rose"
status = "active"
reading_time = "8 min"
author = "Tomas Korcak (korczis)"
word_count = 1361
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["JOSE", "JSON", "Object", "Signing", "Encryption", "technologies", "security", "Prismatic Platform", "JSON Web"]
tags = ["technologies", "security", "jose", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "JOSE - Prismatic Platform"
+++

## Overview

JOSE (JSON Object Signing and Encryption) is the cryptographic library that handles all token-based authentication in the Prismatic Platform. It implements the complete JOSE standard family -- JWT (JSON Web Tokens), JWS (JSON Web Signature), JWE (JSON Web Encryption), and JWK (JSON Web Keys) -- providing the foundation for the platform's API authentication, session management, and inter-service authorization. Every authenticated request to the platform, whether from a browser session, an API client, or an inter-service call, passes through JOSE for token creation or verification.

The Prismatic Platform uses JOSE for generating and verifying JWT tokens that authenticate API requests, establish WebSocket connections, and authorize inter-application communication within the umbrella. JOSE's support for multiple signing algorithms (HS256, RS256, ES256, EdDSA) enables the platform to use the appropriate algorithm for each security context -- symmetric HMAC for internal service tokens where both parties share the secret, and asymmetric RSA or ECDSA for external-facing tokens where the verification key can be distributed publicly.

JOSE's JWK support enables key rotation without service interruption -- the platform can publish new signing keys while continuing to accept tokens signed with previous keys during a transition period. This zero-downtime rotation capability is essential for a production security platform that cannot afford authentication outages during key management operations.

## Key Features

- **JWT Generation**: Create signed and encrypted tokens with custom claims, expiration, and audience restrictions
- **Token Verification**: Validate signatures, expiry, issuer, audience, and custom claim assertions
- **Multiple Algorithms**: HMAC (HS256/384/512), RSA (RS256/384/512), ECDSA (ES256/384/512), and EdDSA signing support
- **JWK Management**: JSON Web Key generation, import, export, and rotation with multiple key types
- **JWE Encryption**: Payload encryption for sensitive token contents using A128GCM, A256GCM, and other algorithms
- **Key Rotation**: Multi-key verification for zero-downtime key rotation with configurable grace periods
- **JOSE Header Customization**: Full control over JWS and JWE headers for standards-compliant token construction
- **Performance**: NIF-backed cryptographic operations for high-throughput token processing

## Platform Integration

JOSE handles all token-based authentication across the platform. The following module demonstrates the standard pattern for token generation and verification used by the API and web interfaces.

```elixir
defmodule PrismaticWeb.Auth.Token do
  @moduledoc """
  JWT token management for API and session authentication.
  Uses JOSE for signing, verification, and key management.
  """

  @signing_key JOSE.JWK.generate_key({:oct, 32})
  @token_ttl_seconds 3600
  @refresh_ttl_seconds 86_400

  @spec generate(String.t(), map()) :: {:ok, String.t()}
  def generate(user_id, claims \\ %{}) do
    now = System.system_time(:second)

    payload = Map.merge(claims, %{
      "sub" => user_id,
      "iat" => now,
      "exp" => now + @token_ttl_seconds,
      "iss" => "prismatic",
      "jti" => generate_jti()
    })

    {_, token} = JOSE.JWT.sign(@signing_key, %{"alg" => "HS256"}, payload)
    |> JOSE.JWS.compact()

    {:ok, token}
  end

  @spec verify(String.t()) :: {:ok, map()} | {:error, atom()}
  def verify(token) do
    case JOSE.JWT.verify_strict(@signing_key, ["HS256"], token) do
      {true, %JOSE.JWT{fields: claims}, _jws} ->
        validate_claims(claims)

      {false, _, _} ->
        {:error, :invalid_signature}
    end
  end

  @spec generate_refresh_token(String.t()) :: {:ok, String.t()}
  def generate_refresh_token(user_id) do
    now = System.system_time(:second)

    payload = %{
      "sub" => user_id,
      "iat" => now,
      "exp" => now + @refresh_ttl_seconds,
      "iss" => "prismatic",
      "type" => "refresh",
      "jti" => generate_jti()
    }

    {_, token} = JOSE.JWT.sign(@signing_key, %{"alg" => "HS256"}, payload)
    |> JOSE.JWS.compact()

    {:ok, token}
  end

  defp validate_claims(%{"exp" => exp} = claims) do
    if System.system_time(:second) < exp do
      {:ok, claims}
    else
      {:error, :token_expired}
    end
  end

  defp generate_jti, do: :crypto.strong_rand_bytes(16) |> Base.url_encode64(padding: false)
end
```

## Architecture

JOSE operates at the authentication boundary of the platform's security architecture, providing cryptographic services to multiple consumers.

| Consumer | Token Type | Algorithm | TTL | Purpose |
|----------|-----------|-----------|-----|---------|
| Browser Sessions | Access JWT | HS256 | 1 hour | LiveView and page authentication |
| API Clients | API JWT | HS256 | 1 hour | REST and GraphQL API access |
| Refresh Tokens | Refresh JWT | HS256 | 24 hours | Silent token renewal |
| WebSocket Auth | Connection JWT | HS256 | 1 hour | [Phoenix LiveView](/technologies/phoenix-liveview/) channel auth |
| Inter-service | Service JWT | RS256 | 5 minutes | Umbrella app communication |
| External Webhooks | Signed Payload | ES256 | N/A | Outbound webhook signatures |

The authentication flow integrates JOSE with [Phoenix](/technologies/phoenix/) Plugs to verify tokens on every request.

```elixir
defmodule PrismaticWeb.Plugs.APIAuth do
  @moduledoc """
  Plug that verifies JWT tokens on API requests.
  """
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    with ["Bearer " <> token] <- get_req_header(conn, "authorization"),
         {:ok, claims} <- PrismaticWeb.Auth.Token.verify(token) do
      conn
      |> assign(:current_user_id, claims["sub"])
      |> assign(:token_claims, claims)
    else
      _ ->
        conn
        |> put_status(401)
        |> Phoenix.Controller.json(%{error: "unauthorized"})
        |> halt()
    end
  end
end
```

## Key Rotation and JWK Management

Key rotation is a critical operational concern for any production authentication system. The Prismatic Platform implements automated key rotation with a configurable grace period during which tokens signed with the previous key are still accepted. This prevents authentication failures during the transition window when some tokens in circulation were signed with the old key while new tokens are signed with the current key.

The platform maintains a JWK Set (JWKS) that contains the current signing key and up to two previous keys. The verification process attempts validation against all keys in the set, accepting the token if any key produces a valid signature. This approach means that key rotation is entirely transparent to clients -- no token refresh is required when a new signing key is deployed.

```elixir
defmodule PrismaticWeb.Auth.KeyManager do
  @moduledoc """
  Manages signing key rotation with zero-downtime transitions.
  """
  use GenServer

  @rotation_interval :timer.hours(24 * 30)
  @max_previous_keys 2

  def init(_opts) do
    state = %{
      current_key: JOSE.JWK.generate_key({:oct, 32}),
      previous_keys: [],
      rotated_at: DateTime.utc_now()
    }
    schedule_rotation()
    {:ok, state}
  end

  def handle_info(:rotate, state) do
    new_key = JOSE.JWK.generate_key({:oct, 32})
    previous = [state.current_key | state.previous_keys]
    |> Enum.take(@max_previous_keys)

    schedule_rotation()
    {:noreply, %{state | current_key: new_key, previous_keys: previous, rotated_at: DateTime.utc_now()}}
  end

  def verify_with_rotation(token, state) do
    all_keys = [state.current_key | state.previous_keys]
    Enum.find_value(all_keys, {:error, :invalid_signature}, fn key ->
      case JOSE.JWT.verify_strict(key, ["HS256"], token) do
        {true, jwt, _jws} -> {:ok, jwt.fields}
        _ -> nil
      end
    end)
  end

  defp schedule_rotation do
    Process.send_after(self(), :rotate, @rotation_interval)
  end
end
```

## Token Revocation Strategy

While JWTs are stateless by design, certain security scenarios require the ability to invalidate tokens before their natural expiration. The platform implements a token revocation strategy using [Redis](/technologies/redis/) as a blacklist store. When a user logs out, changes their password, or when a security incident requires mass token invalidation, the token's `jti` (JWT ID) claim is added to the Redis blacklist with a TTL matching the token's remaining lifetime.

This approach keeps the performance benefits of stateless JWT verification for the common case (no Redis lookup required unless the token is blacklisted) while providing the security guarantee that compromised tokens can be immediately invalidated across all cluster nodes.

## Performance Characteristics

JOSE's cryptographic operations are performance-critical since they execute on every authenticated request.

| Operation | Latency | Throughput | Notes |
|-----------|---------|------------|-------|
| HS256 Sign | < 10 microseconds | ~100K ops/sec | Symmetric, fastest option |
| HS256 Verify | < 10 microseconds | ~100K ops/sec | Constant-time comparison |
| RS256 Sign | ~1 ms | ~1K ops/sec | Asymmetric, CPU-intensive |
| RS256 Verify | ~50 microseconds | ~20K ops/sec | Verification is faster than signing |
| ES256 Sign | ~200 microseconds | ~5K ops/sec | Elliptic curve, compact signatures |
| ES256 Verify | ~500 microseconds | ~2K ops/sec | Curve verification |
| JWK Generation (oct) | < 1 ms | N/A | One-time at startup |
| JWK Generation (RSA) | ~100 ms | N/A | One-time at startup |

HS256 is the default algorithm for the platform's internal tokens because it offers the best performance for scenarios where both the signer and verifier share the same secret. RS256 and ES256 are reserved for external-facing tokens where asymmetric verification is required.

## Configuration

JOSE token configuration is managed through the platform's runtime configuration system.

```elixir
# Token configuration in config/runtime.exs
config :prismatic_web, :auth,
  signing_algorithm: "HS256",
  signing_key: System.get_env("JWT_SIGNING_KEY"),
  token_ttl: 3600,
  refresh_ttl: 86400,
  issuer: "prismatic",
  allowed_algorithms: ["HS256"],
  key_rotation_grace_period: 3600

# Key rotation configuration
config :prismatic_web, :key_rotation,
  enabled: true,
  rotation_interval: :timer.hours(24 * 30),
  grace_period: :timer.hours(1),
  previous_keys_retained: 2
```

## Security Considerations

The platform enforces strict security practices around JOSE token handling to prevent common JWT vulnerabilities:

| Vulnerability | Mitigation | Enforcement |
|--------------|-----------|-------------|
| Algorithm confusion | `verify_strict/3` with explicit algorithm list | Mandatory in all verification paths |
| Token replay | Unique `jti` claims with Redis-backed revocation | Automatic on token generation |
| Expired token acceptance | Server-side `exp` claim validation | `validate_claims/1` on every verification |
| Key exposure | Runtime environment variables, never in source | Fly.io secrets management |
| Unsigned token acceptance | Reject `alg: "none"` via `verify_strict` | JOSE library default behavior |
| Cross-service token misuse | Audience (`aud`) claim validation | Per-service audience configuration |

## Best Practices

- **Use `verify_strict/3`** instead of `verify/2` -- strict verification requires specifying allowed algorithms, preventing algorithm confusion attacks where an attacker switches from RS256 to HS256
- **Always include `exp` claims** -- tokens without expiration are security vulnerabilities; the platform enforces maximum TTLs for all token types
- **Generate unique `jti` claims** -- token identifiers enable server-side revocation and prevent replay attacks
- **Rotate keys regularly** -- use the key rotation configuration to automatically generate new signing keys with a grace period for in-flight tokens
- **Use HS256 for internal tokens** -- symmetric signing is faster and simpler when both parties share a secret; reserve asymmetric algorithms for external-facing tokens
- **Store signing keys securely** -- signing keys are stored in [Fly.io](/technologies/flyio/) secrets and loaded at runtime, never committed to version control
- **Validate all claims** -- verify issuer, audience, expiration, and custom claims; do not trust token contents without validation
- **Use JWE for sensitive payloads** -- encrypt token contents that carry security-critical information to prevent inspection even when the token is intercepted

## Comparison with Alternatives

| Feature | JOSE (Elixir) | Guardian | Joken | Pow |
|---------|--------------|----------|-------|-----|
| JWT Support | Full JOSE suite | JWT only | JWT only | Session-based |
| JWE Encryption | Yes | No | No | N/A |
| JWK Management | Yes | No | No | N/A |
| Key Rotation | Built-in | Manual | Manual | N/A |
| Algorithm Support | All JOSE algorithms | HS256, RS256 | HS256, RS256 | N/A |
| Token Refresh | Manual | Built-in | Manual | Automatic |
| Complexity | Low-level | High-level | Medium | High-level |
| Platform Choice | Primary | Not used | Not used | Not used |

JOSE was chosen over higher-level libraries like Guardian because the platform requires fine-grained control over token construction, algorithm selection, and key management that only the low-level JOSE library provides. Guardian and Joken abstract away the JOSE primitives, which simplifies common use cases but limits the platform's ability to implement advanced patterns like multi-key rotation, JWE encryption for sensitive payloads, and custom claim validation pipelines.

The platform also leverages JOSE's JWE (JSON Web Encryption) capabilities for encrypting sensitive token payloads that carry security-critical information. While standard signed JWTs are readable by anyone who possesses the token, JWE-encrypted tokens protect their contents from inspection, which is important for inter-service tokens that may traverse network segments with different trust levels. This layered approach -- signing for integrity and encryption for confidentiality -- provides defense in depth for the platform's token-based authentication system.

## Related Technologies

- [Phoenix](/technologies/phoenix/) - Web framework consuming JOSE tokens via Plug authentication
- [Argon2](/technologies/argon2/) - Password hashing companion for credential-based authentication
- [Plug](/technologies/plug/) - Middleware layer integrating JOSE token verification into request pipelines
- [Ecto](/technologies/ecto/) - Database layer storing user credentials and token revocation lists
- [Redis](/technologies/redis/) - Token blacklist and session store for revocation support
- [SSL/TLS](/technologies/ssl-tls/) - Transport-layer encryption complementing application-layer token security

## Related Apps

- [prismatic_web](/apps/prismatic-web/) - Browser session tokens and LiveView authentication
- [prismatic_api](/apps/prismatic-api/) - API authentication tokens for the REST gateway
- [prismatic_auth](/apps/prismatic-auth/) - Core authentication module managing token lifecycle

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)