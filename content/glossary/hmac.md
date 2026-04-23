+++
title = "HMAC (Hash-Based Message Authentication Code)"
weight = 50
[extra]
tags = ["glossary", "security", "authentication", "cryptography", "api", "integrity", "message-authentication", "hashing"]
description = "HMAC is a cryptographic mechanism that combines a hash function with a secret key to provide both message integrity verification and authentication, ensuring that data has not been tampered with and originates from a trusted source"
category = "security"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "13 min"
difficulty = "intermediate"
quality_score = 95
related_terms = ["authentication", "encryption", "jwt", "oauth2", "api-gateway", "security", "tls", "credential-management", "rest-api", "zero-trust"]
key_concepts = ["message authentication", "hash functions", "secret key cryptography", "integrity verification", "timing-safe comparison"]
platform_relevance = "critical"
date_created = "2026-02-22"
date_updated = "2026-02-22"
aliases = ["HMAC authentication", "keyed-hash message authentication code", "HMAC-SHA256"]
word_count = 1715
date_modified = "2026-02-23"
keywords = ["HMAC", "Hash-Based", "Message", "Authentication", "Code", "glossary", "security", "Prismatic Platform"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "HMAC (Hash-Based Message Authentication Code) - Prismatic Platform"
+++

## Definition

HMAC (Hash-Based Message Authentication Code) is a specific type of message authentication code that uses a cryptographic hash function (such as SHA-256 or SHA-512) combined with a secret key to simultaneously verify the integrity and authenticity of a message. Defined in RFC 2104 and FIPS 198-1, HMAC provides a mathematically rigorous guarantee that a message has not been altered in transit and was produced by an entity possessing the shared secret key. Within the Prismatic Platform, HMAC serves as a foundational primitive for API authentication, webhook verification, inter-service communication integrity, and secure token generation across the umbrella application ecosystem.

Unlike a simple hash (which anyone can compute), HMAC requires knowledge of a secret key, making it impossible for an attacker who intercepts a message to forge a valid authentication code without possessing the key. This property makes HMAC particularly valuable for authenticating API requests, verifying webhook payloads from external services, and ensuring that configuration data has not been tampered with during transmission between distributed system components.

## Overview

The HMAC algorithm operates by processing the secret key and message through two rounds of hashing. The key is first padded to the hash function's block size, then XORed with two distinct padding constants (the inner pad and outer pad). The inner hash processes the XORed key concatenated with the message, and the outer hash processes the XORed key concatenated with the inner hash result. This double-hashing construction provides security properties that a naive approach of simply concatenating key and message before hashing would not achieve.

Mathematically, HMAC is defined as:

```
HMAC(K, m) = H((K' XOR opad) || H((K' XOR ipad) || m))
```

Where `K'` is the key padded to the block size, `H` is the hash function, `opad` is the outer padding (0x5c repeated), and `ipad` is the inner padding (0x36 repeated).

In the context of the Prismatic Platform, HMAC is used across several critical security boundaries. API requests from external clients carry HMAC signatures that the platform verifies before processing. Webhook callbacks from third-party services (such as GitLab CI notifications or payment provider events) include HMAC signatures that Prismatic validates to prevent forgery. Internal communication between umbrella applications uses HMAC to ensure message integrity when messages traverse process boundaries or are serialized to external storage.

The BEAM virtual machine provides efficient binary processing capabilities that make HMAC computation fast and memory-efficient. Erlang's `:crypto` module wraps OpenSSL's HMAC implementation, providing constant-time operations that resist timing side-channel attacks -- a critical property when comparing HMAC values.

## Technical Details

Elixir and Erlang provide HMAC support through the `:crypto` module, which delegates to OpenSSL for the actual cryptographic operations. The Prismatic Platform wraps these primitives in higher-level modules that enforce security best practices.

```elixir
defmodule Prismatic.Security.HMAC do
  @moduledoc """
  HMAC computation and verification with timing-safe comparison.
  Supports multiple hash algorithms and provides a consistent
  interface for HMAC operations across the platform.
  """

  @type algorithm :: :sha256 | :sha384 | :sha512
  @type secret :: binary()
  @type message :: binary()

  @default_algorithm :sha256
  @minimum_key_length 32

  @spec sign(message(), secret(), algorithm()) :: binary()
  def sign(message, secret, algorithm \\ @default_algorithm)
      when is_binary(message) and is_binary(secret) do
    validate_key_length!(secret)
    :crypto.mac(:hmac, algorithm, secret, message)
  end

  @spec sign_hex(message(), secret(), algorithm()) :: String.t()
  def sign_hex(message, secret, algorithm \\ @default_algorithm) do
    message
    |> sign(secret, algorithm)
    |> Base.encode16(case: :lower)
  end

  @spec verify(message(), binary(), secret(), algorithm()) :: boolean()
  def verify(message, expected_mac, secret, algorithm \\ @default_algorithm)
      when is_binary(message) and is_binary(expected_mac) and is_binary(secret) do
    computed_mac = sign(message, secret, algorithm)
    constant_time_compare(computed_mac, expected_mac)
  end

  @spec verify_hex(message(), String.t(), secret(), algorithm()) :: boolean()
  def verify_hex(message, expected_hex, secret, algorithm \\ @default_algorithm) do
    case Base.decode16(expected_hex, case: :mixed) do
      {:ok, expected_mac} -> verify(message, expected_mac, secret, algorithm)
      :error -> false
    end
  end

  @spec constant_time_compare(binary(), binary()) :: boolean()
  defp constant_time_compare(left, right) when byte_size(left) != byte_size(right), do: false

  defp constant_time_compare(left, right) do
    :crypto.hash_equals(left, right)
  end

  defp validate_key_length!(key) when byte_size(key) < @minimum_key_length do
    raise ArgumentError,
          "HMAC key must be at least #{@minimum_key_length} bytes, got #{byte_size(key)}"
  end

  defp validate_key_length!(_key), do: :ok
end
```

### API Request Authentication with HMAC

The Prismatic Platform uses HMAC to authenticate incoming API requests. The client constructs a canonical request string, computes an HMAC signature using a shared secret, and includes the signature in the request headers:

```elixir
defmodule PrismaticApi.Plugs.HMACAuth do
  @moduledoc """
  Plug that verifies HMAC signatures on incoming API requests.
  Implements a signing scheme similar to AWS Signature Version 4.
  """

  import Plug.Conn

  @behaviour Plug

  @signature_header "x-prismatic-signature"
  @timestamp_header "x-prismatic-timestamp"
  @max_clock_skew 300

  @impl true
  def init(opts), do: opts

  @impl true
  def call(conn, _opts) do
    with {:ok, signature} <- extract_header(conn, @signature_header),
         {:ok, timestamp} <- extract_header(conn, @timestamp_header),
         :ok <- validate_timestamp(timestamp),
         {:ok, secret} <- fetch_client_secret(conn),
         canonical <- build_canonical_request(conn, timestamp),
         true <- Prismatic.Security.HMAC.verify_hex(canonical, signature, secret) do
      conn
    else
      _ ->
        conn
        |> put_status(401)
        |> Phoenix.Controller.json(%{error: "Invalid HMAC signature"})
        |> halt()
    end
  end

  defp extract_header(conn, header) do
    case get_req_header(conn, header) do
      [value | _] -> {:ok, value}
      [] -> {:error, :missing_header}
    end
  end

  defp validate_timestamp(timestamp_str) do
    with {timestamp, _} <- Integer.parse(timestamp_str),
         now <- System.system_time(:second),
         true <- abs(now - timestamp) <= @max_clock_skew do
      :ok
    else
      _ -> {:error, :clock_skew}
    end
  end

  defp build_canonical_request(conn, timestamp) do
    [
      String.upcase(to_string(conn.method)),
      conn.request_path,
      conn.query_string || "",
      timestamp
    ]
    |> Enum.join("\n")
  end

  defp fetch_client_secret(conn) do
    case get_req_header(conn, "x-prismatic-client-id") do
      [client_id | _] -> Prismatic.Security.KeyStore.get_secret(client_id)
      [] -> {:error, :missing_client_id}
    end
  end
end
```

### Webhook Verification

External services send webhook payloads with HMAC signatures. The platform verifies these signatures before processing the payload:

```elixir
defmodule Prismatic.Webhooks.Verifier do
  @moduledoc """
  Verifies HMAC signatures on incoming webhook payloads
  from external services (GitLab, GitHub, Stripe, etc.).
  """

  @spec verify_gitlab(binary(), String.t(), String.t()) :: :ok | {:error, :invalid_signature}
  def verify_gitlab(payload, signature, secret) do
    if Prismatic.Security.HMAC.verify_hex(payload, signature, secret) do
      :ok
    else
      {:error, :invalid_signature}
    end
  end

  @spec verify_github(binary(), String.t(), String.t()) :: :ok | {:error, :invalid_signature}
  def verify_github(payload, "sha256=" <> signature, secret) do
    if Prismatic.Security.HMAC.verify_hex(payload, signature, secret, :sha256) do
      :ok
    else
      {:error, :invalid_signature}
    end
  end

  def verify_github(_payload, _signature, _secret), do: {:error, :invalid_signature}
end
```

## Implementation

Implementing HMAC-based authentication in a production system requires attention to several security-critical details beyond the core cryptographic operation.

### Key Management

HMAC security depends entirely on the secrecy and quality of the shared key. Keys must be generated using a cryptographically secure random number generator, stored securely (never in source code or environment variables in plain text), and rotated on a regular schedule:

```elixir
defmodule Prismatic.Security.KeyStore do
  @moduledoc """
  Secure storage and retrieval of HMAC keys.
  Keys are stored encrypted at rest and cached in ETS for performance.
  """

  use GenServer

  @table :hmac_key_store
  @rotation_interval :timer.hours(24 * 30)

  @spec generate_key() :: binary()
  def generate_key do
    :crypto.strong_rand_bytes(64)
  end

  @spec get_secret(String.t()) :: {:ok, binary()} | {:error, :not_found}
  def get_secret(client_id) do
    case :ets.lookup(@table, client_id) do
      [{^client_id, secret, _expires_at}] -> {:ok, secret}
      [] -> {:error, :not_found}
    end
  end

  @spec rotate_key(String.t()) :: {:ok, binary()}
  def rotate_key(client_id) do
    new_key = generate_key()
    GenServer.call(__MODULE__, {:rotate, client_id, new_key})
    {:ok, new_key}
  end
end
```

### Request Signing (Client Side)

Clients compute HMAC signatures following a canonical request format. This ensures that any modification to the request method, path, query parameters, or body invalidates the signature.

## Comparison

| Mechanism | Authentication | Integrity | Non-Repudiation | Performance | Key Distribution |
|-----------|---------------|-----------|-----------------|-------------|-----------------|
| **HMAC** | Yes (shared secret) | Yes | No | Fast | Requires secure channel |
| **Digital Signatures (RSA/ECDSA)** | Yes (public key) | Yes | Yes | Slower | Public key can be shared openly |
| **JWT (with HMAC)** | Yes | Yes (payload) | No | Fast | Same as HMAC |
| **API Keys** | Yes (bearer token) | No | No | Fastest | Simple distribution |
| **mTLS** | Yes (certificates) | Yes (transport) | Yes | Moderate | Certificate infrastructure required |
| **OAuth2 Bearer Tokens** | Yes | No (token itself) | No | Fast | Authorization server required |

### When HMAC is the Right Choice

HMAC is optimal when both parties can securely share a secret key, non-repudiation is not required, and performance is important. It is simpler to implement than full digital signatures and provides both authentication and integrity verification, making it stronger than simple API key authentication. The Prismatic Platform uses HMAC for service-to-service authentication where both services are under the same administrative control, and digital signatures for scenarios where non-repudiation is required (such as audit logs).

### When HMAC is Not Sufficient

HMAC cannot provide non-repudiation -- since both parties share the same key, either party could have produced the signature. If you need to prove that a specific party signed a message (for legal or compliance purposes), you need asymmetric digital signatures. HMAC also requires a secure channel for initial key distribution, which creates a bootstrapping challenge in some deployment scenarios.

## Best Practices

**1. Use timing-safe comparison for HMAC verification.** A naive byte-by-byte comparison leaks information about how many bytes of the expected HMAC match the computed HMAC. An attacker can exploit this timing side-channel to forge valid signatures one byte at a time. Erlang's `:crypto.hash_equals/2` provides constant-time comparison.

**2. Enforce minimum key lengths.** HMAC keys shorter than the hash function's output length weaken security. For SHA-256, use at least 32 bytes (256 bits) of key material. The Prismatic Platform enforces a 32-byte minimum and recommends 64 bytes.

**3. Generate keys with cryptographically secure random number generators.** Never derive HMAC keys from passwords, timestamps, or other predictable sources. Use `:crypto.strong_rand_bytes/1` in Elixir, which delegates to the operating system's CSPRNG.

**4. Include a timestamp in signed requests.** Without a timestamp, a valid HMAC signature can be replayed indefinitely. Including a timestamp and rejecting requests with excessive clock skew (the Prismatic Platform uses 5 minutes) prevents replay attacks.

**5. Sign the canonical request, not raw bytes.** Define a canonical request format that includes the HTTP method, path, query parameters, and relevant headers. This prevents signature stripping attacks where an attacker modifies unsigned portions of the request.

**6. Rotate keys regularly.** Key rotation limits the window of exposure if a key is compromised. The Prismatic Platform supports dual-key validation during rotation windows, accepting signatures from both the current and previous key for a configurable overlap period.

**7. Never log HMAC keys or signatures.** Even in debug logs, HMAC keys must not appear. The Prismatic Platform's structured logging automatically redacts fields matching key-related patterns.

## Pitfalls

**Using a simple hash instead of HMAC.** Computing `SHA256(key + message)` is not equivalent to HMAC and is vulnerable to length extension attacks. The HMAC construction with its double-hashing and padding specifically prevents this class of attacks. Always use the HMAC construction, never a naive key-prefix hash.

**Comparing HMAC values with standard equality operators.** Elixir's `==` operator for binaries may short-circuit on the first differing byte, enabling timing attacks. Always use `:crypto.hash_equals/2` or an equivalent constant-time comparison function.

**Hardcoding keys in source code.** HMAC keys committed to version control are effectively public. Use environment variables, secrets management systems (Vault, AWS Secrets Manager), or encrypted configuration files. The Prismatic Platform stores HMAC keys in encrypted ETS tables backed by the system's secure storage.

**Ignoring clock skew in timestamp validation.** If your timestamp validation window is too tight, legitimate requests from clients with slightly desynchronized clocks are rejected. If too loose, replay attacks become feasible. The 5-minute window used by Prismatic balances these concerns, but environments with high-precision time synchronization (NTP) can use tighter windows.

**Using HMAC for password storage.** HMAC is designed for message authentication, not password hashing. For password storage, use a dedicated password hashing function like bcrypt, scrypt, or Argon2, which are deliberately slow and resistant to brute-force attacks. HMAC is fast by design, which is a weakness when hashing passwords.

**Reusing HMAC keys across different contexts.** A key used for API authentication should not also be used for webhook verification or token generation. Key reuse across contexts can enable cross-protocol attacks. Derive context-specific keys from a master key using HKDF (HMAC-based Key Derivation Function).

## Use Cases

**API request authentication.** The primary use case for HMAC in the Prismatic Platform is authenticating incoming API requests to the REST gateway on port 4004. Each API client is issued a unique HMAC key, and every request must include a valid HMAC signature computed over the canonical request representation.

**Webhook payload verification.** When external services (GitLab, GitHub, Stripe) send webhook callbacks, they include HMAC signatures computed with a shared secret. The Prismatic Platform verifies these signatures before processing webhooks, preventing forgery by attackers who might discover webhook endpoints.

**Inter-service message integrity.** In the umbrella application architecture, messages serialized through Broadway pipelines or published to PubSub channels carry HMAC signatures that receiving services verify. This prevents message tampering if an attacker gains access to the message transport layer.

**Secure token generation.** HMAC is used to generate short-lived tokens for one-time operations such as email verification, password reset, and account activation. The token encodes the operation parameters and an expiry timestamp, signed with an HMAC to prevent forgery.

**Configuration integrity verification.** Deployment configurations that traverse untrusted channels (such as CI/CD pipelines) carry HMAC signatures that the deployment target verifies before applying. This ensures that configuration has not been modified in transit.

**Audit log tamper detection.** Audit log entries are chained using HMAC: each entry includes an HMAC computed over the entry content and the previous entry's HMAC, forming a hash chain. Any modification to a historical entry invalidates all subsequent HMACs, making tampering detectable.

## Related Concepts

HMAC connects to many security and authentication concepts in the Prismatic Platform:

- [Authentication](@/glossary/authentication.md) is the broader discipline that HMAC supports as a verification mechanism
- [Encryption](@/glossary/encryption.md) protects data confidentiality, complementing HMAC's integrity and authentication guarantees
- [JWT](@/glossary/jwt.md) frequently uses HMAC-SHA256 as its signing algorithm for token-based authentication
- [OAuth2](@/glossary/oauth2.md) authorization framework that may use HMAC for token signing
- [API Gateway](@/glossary/api-gateway.md) is the entry point where HMAC verification is typically enforced
- [Zero Trust](@/glossary/zero-trust.md) security model where every request must be authenticated, often via HMAC
- [TLS](@/glossary/tls.md) provides transport-layer security that complements HMAC's application-layer message authentication
- [Credential Management](@/glossary/credential-management.md) governs the secure storage and rotation of HMAC keys
- [REST API](@/glossary/rest-api.md) is the primary interface where HMAC authentication is applied in Prismatic
- [Security](@/glossary/security.md) is the overarching domain that HMAC serves as a cryptographic primitive

## See Also

- [Input Sanitization](@/glossary/input-sanitization.md) -- complementary defense against injection attacks
- [Rate Limiting](@/glossary/rate-limiting.md) -- protects HMAC-authenticated endpoints from abuse
- [Audit Logging](@/glossary/audit-logging.md) -- records HMAC verification events for compliance
- [Authorization](@/glossary/authorization.md) -- determines what an HMAC-authenticated client can access
- [Constant Time](@/glossary/constant-time.md) -- timing-safe operations critical for HMAC comparison
- [Encryption at Rest](@/glossary/encryption-at-rest.md) -- secures stored HMAC keys

---

**Built with precision. Ready for the future.**

*Created by [Tomas Korcak (korczis)](https://github.com/korczis) | [Prismatic Platform](https://github.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis)*
