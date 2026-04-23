+++
title = "Encryption"
weight = 50
[extra]
tags = ["glossary", "security", "encryption", "cryptography", "tls", "data-protection", "privacy", "compliance"]
description = "The process of encoding information using mathematical algorithms so that only authorized parties possessing the correct decryption key can access the original data, forming the foundation of data confidentiality in modern systems"
category = "security"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-to-advanced"
domain_category = "Security Engineering"
related_concepts = ["encryption-at-rest", "tls", "authentication", "security-operations", "certificate-transparency", "credential-management", "authorization"]
implementation_status = "production"
authority_level = "platform-wide"
difficulty_rating = 6
prerequisites = ["security-operations", "authentication", "tls"]
learning_path = ["authentication", "tls", "encryption", "encryption-at-rest", "certificate-transparency"]
interactive_demos = ["/labs/glossary/encryption"]
code_examples = ["Elixir encryption wrapper", "Key derivation functions", "Credential vault implementation"]
external_resources = ["https://hexdocs.pm/plug_crypto/Plug.Crypto.html", "https://www.erlang.org/doc/man/crypto.html", "https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines"]
version_introduced = "gen-3"
stability_level = "stable"
testing_scenarios = ["Encryption/decryption round-trip", "Key rotation", "Invalid key handling", "Algorithm negotiation", "Certificate validation"]
keywords = ["encryption", "cryptography", "AES", "TLS", "SSL", "data protection", "key management", "symmetric", "asymmetric", "cipher"]
related_terms = ["encryption-at-rest", "tls", "authentication", "security-operations", "certificate-transparency", "credential-management", "authorization", "audit-trail", "policy", "attack-surface"]
word_count = 1617
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Encryption - Prismatic Platform"
+++

## Definition

**Encryption** is the process of transforming plaintext data into ciphertext using a mathematical algorithm (cipher) and a secret key, such that only parties possessing the corresponding decryption key can recover the original information. Encryption is the foundational mechanism for data confidentiality -- one of the three pillars of information security alongside integrity and availability. Modern encryption operates through two primary paradigms: symmetric encryption (where the same key encrypts and decrypts) and asymmetric encryption (where mathematically related but distinct public and private keys are used for encryption and decryption respectively).

In the Prismatic Platform, encryption operates at multiple layers: [TLS](@/glossary/tls.md) secures all network communication, [encryption at rest](@/glossary/encryption-at-rest.md) protects stored data, [credential management](@/glossary/credential-management.md) safeguards API keys and tokens, and [certificate transparency](@/glossary/certificate-transparency.md) monitoring ensures the integrity of the platform's PKI infrastructure.

## Overview

Encryption has evolved from ancient substitution ciphers to mathematically rigorous algorithms that underpin all modern digital communication. The field rests on a fundamental principle articulated by Auguste Kerckhoffs in 1883: a cryptographic system should be secure even if everything about the system, except the key, is public knowledge. This principle drives modern encryption design, where algorithm transparency and key secrecy work in concert.

### Symmetric Encryption

Symmetric algorithms use a single shared key for both encryption and decryption. They are computationally efficient and suitable for bulk data encryption:

- **AES (Advanced Encryption Standard)**: The dominant symmetric cipher, operating on 128-bit blocks with 128, 192, or 256-bit keys. AES-256-GCM (Galois/Counter Mode) provides both confidentiality and integrity (authenticated encryption).
- **ChaCha20-Poly1305**: A stream cipher alternative to AES, often faster on systems without hardware AES acceleration. Used extensively in TLS 1.3 and WireGuard.

### Asymmetric Encryption

Asymmetric algorithms use key pairs -- a public key for encryption and a private key for decryption. They solve the key distribution problem but are computationally expensive:

- **RSA**: Based on the difficulty of factoring large integers. Key sizes of 2048 or 4096 bits are standard.
- **Elliptic Curve Cryptography (ECC)**: Achieves equivalent security with smaller keys (256-bit ECC approximates 3072-bit RSA), offering better performance.
- **X25519/Ed25519**: Modern elliptic curve implementations used in TLS 1.3 key exchange and digital signatures.

### Hybrid Encryption

In practice, systems combine both approaches: asymmetric encryption exchanges a symmetric session key, which then encrypts the actual data. This is exactly how [TLS](@/glossary/tls.md) works -- the handshake uses asymmetric cryptography to establish a shared secret, then symmetric ciphers encrypt the session.

### Key Derivation

When encryption keys must be derived from passwords or other low-entropy sources, key derivation functions (KDFs) stretch and strengthen the input:

- **Argon2**: Memory-hard KDF, winner of the Password Hashing Competition, resistant to GPU-based attacks.
- **PBKDF2**: Older but widely deployed, uses iterated HMAC-SHA256.
- **scrypt**: Memory-hard alternative predating Argon2.

## Technical Details

### Encryption in the BEAM Ecosystem

Erlang/OTP provides the `:crypto` module, which wraps OpenSSL's libcrypto library. Elixir builds on this foundation through several layers:

```elixir
defmodule Prismatic.Security.Encryption do
  @moduledoc """
  Provides encryption primitives for the Prismatic Platform.
  Wraps Erlang's :crypto module with Elixir-idiomatic interfaces
  and enforces platform security policies.
  """

  @type cipher :: :aes_256_gcm | :chacha20_poly1305
  @type key :: binary()
  @type plaintext :: binary()
  @type ciphertext :: binary()
  @type iv :: binary()
  @type tag :: binary()
  @type aad :: binary()

  @aes_key_size 32
  @iv_size 12
  @tag_size 16

  @spec encrypt(plaintext(), key(), cipher()) ::
          {:ok, {ciphertext(), iv(), tag()}} | {:error, term()}
  def encrypt(plaintext, key, cipher \\ :aes_256_gcm)

  def encrypt(plaintext, key, :aes_256_gcm) when byte_size(key) == @aes_key_size do
    iv = :crypto.strong_rand_bytes(@iv_size)
    aad = build_aad()

    case :crypto.crypto_one_time_aead(
           :aes_256_gcm, key, iv, plaintext, aad, @tag_size, true
         ) do
      {ciphertext, tag} ->
        {:ok, {ciphertext, iv, tag}}

      error ->
        {:error, {:encryption_failed, error}}
    end
  end

  def encrypt(_plaintext, key, :aes_256_gcm) do
    {:error, {:invalid_key_size, byte_size(key), @aes_key_size}}
  end

  def encrypt(plaintext, key, :chacha20_poly1305) when byte_size(key) == @aes_key_size do
    iv = :crypto.strong_rand_bytes(@iv_size)
    aad = build_aad()

    case :crypto.crypto_one_time_aead(
           :chacha20_poly1305, key, iv, plaintext, aad, @tag_size, true
         ) do
      {ciphertext, tag} ->
        {:ok, {ciphertext, iv, tag}}

      error ->
        {:error, {:encryption_failed, error}}
    end
  end

  @spec decrypt(ciphertext(), key(), iv(), tag(), cipher()) ::
          {:ok, plaintext()} | {:error, term()}
  def decrypt(ciphertext, key, iv, tag, cipher \\ :aes_256_gcm)

  def decrypt(ciphertext, key, iv, tag, :aes_256_gcm) do
    aad = build_aad()

    case :crypto.crypto_one_time_aead(
           :aes_256_gcm, key, iv, ciphertext, aad, tag, false
         ) do
      plaintext when is_binary(plaintext) ->
        {:ok, plaintext}

      :error ->
        {:error, :decryption_failed}
    end
  end

  @spec generate_key(cipher()) :: key()
  def generate_key(_cipher \\ :aes_256_gcm) do
    :crypto.strong_rand_bytes(@aes_key_size)
  end

  @spec build_aad() :: aad()
  defp build_aad do
    "prismatic-platform-v1"
  end
end
```

### Key Management

Encryption is only as strong as its key management. The Prismatic Platform implements a layered key management strategy:

```elixir
defmodule Prismatic.Security.KeyVault do
  @moduledoc """
  Manages encryption keys with rotation, derivation, and
  secure storage. Keys are never logged or exposed in
  error messages.
  """

  @type key_id :: String.t()
  @type key_metadata :: %{
    id: key_id(),
    algorithm: atom(),
    created_at: DateTime.t(),
    rotated_at: DateTime.t() | nil,
    status: :active | :rotated | :revoked,
    version: non_neg_integer()
  }

  @spec derive_key(String.t(), binary(), keyword()) ::
          {:ok, binary()} | {:error, term()}
  def derive_key(password, salt, opts \\ []) do
    iterations = Keyword.get(opts, :iterations, 100_000)
    key_length = Keyword.get(opts, :key_length, 32)
    hash = Keyword.get(opts, :hash, :sha256)

    derived =
      :crypto.pbkdf2_hmac(hash, password, salt, iterations, key_length)

    {:ok, derived}
  rescue
    error -> {:error, {:key_derivation_failed, error}}
  end

  @spec rotate_key(key_id()) :: {:ok, key_metadata()} | {:error, term()}
  def rotate_key(key_id) do
    with {:ok, current} <- fetch_key_metadata(key_id),
         {:ok, new_key} <- generate_new_version(current),
         :ok <- mark_previous_as_rotated(current),
         :ok <- store_key_metadata(new_key) do
      {:ok, new_key}
    end
  end

  @spec fetch_key_metadata(key_id()) :: {:ok, key_metadata()} | {:error, term()}
  defp fetch_key_metadata(key_id) do
    case :ets.lookup(:key_vault, key_id) do
      [{^key_id, metadata}] -> {:ok, metadata}
      [] -> {:error, {:key_not_found, key_id}}
    end
  end

  @spec generate_new_version(key_metadata()) :: {:ok, key_metadata()} | {:error, term()}
  defp generate_new_version(current) do
    {:ok, %{current |
      version: current.version + 1,
      rotated_at: DateTime.utc_now(),
      status: :active
    }}
  end

  @spec mark_previous_as_rotated(key_metadata()) :: :ok
  defp mark_previous_as_rotated(metadata) do
    :ets.insert(:key_vault, {metadata.id, %{metadata | status: :rotated}})
    :ok
  end

  @spec store_key_metadata(key_metadata()) :: :ok
  defp store_key_metadata(metadata) do
    :ets.insert(:key_vault, {metadata.id, metadata})
    :ok
  end
end
```

### TLS Configuration

The platform enforces strict TLS configuration to ensure transport-layer encryption meets current security standards:

```elixir
defmodule Prismatic.Security.TLSConfig do
  @moduledoc """
  Provides secure TLS configuration for all platform
  network connections. Enforces TLS 1.2+ with strong
  cipher suites.
  """

  @type tls_opts :: keyword()

  @spec client_options(String.t()) :: tls_opts()
  def client_options(hostname) do
    [
      verify: :verify_peer,
      cacerts: :public_key.cacerts_get(),
      server_name_indication: String.to_charlist(hostname),
      versions: [:"tlsv1.3", :"tlsv1.2"],
      ciphers: preferred_ciphers(),
      depth: 3,
      customize_hostname_check: [
        match_fun: :public_key.pkix_verify_hostname_match_fun(:https)
      ]
    ]
  end

  @spec preferred_ciphers() :: [tuple()]
  defp preferred_ciphers do
    :ssl.cipher_suites(:default, :"tlsv1.3") ++
      :ssl.filter_cipher_suites(
        :ssl.cipher_suites(:default, :"tlsv1.2"),
        [
          key_exchange: &(&1 in [:ecdhe_ecdsa, :ecdhe_rsa]),
          cipher: &(&1 in [:aes_256_gcm, :aes_128_gcm, :chacha20_poly1305])
        ]
      )
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform implements encryption across four distinct layers, each addressing specific threat models:

### Layer 1: Transport Encryption (TLS)

All network communication -- between the platform and external services, between the web interface and browsers, and between internal components when deployed across nodes -- uses [TLS](@/glossary/tls.md) 1.2 or 1.3. The platform's Cowboy/Bandit web servers are configured with modern cipher suites, and certificate management is automated through ACME (Let's Encrypt) integration on Fly.io.

### Layer 2: Encryption at Rest

Sensitive data stored in PostgreSQL uses column-level encryption through `Cloak.Ecto`, which provides transparent encryption/decryption at the Ecto schema layer. ETS tables containing sensitive runtime state use application-level encryption before storage. See [Encryption at Rest](@/glossary/encryption-at-rest.md) for detailed implementation.

### Layer 3: Credential Management

API keys, tokens, and secrets are managed through the [credential management](@/glossary/credential-management.md) system, which encrypts credentials before storage and provides controlled access through a vault abstraction. Credentials are never logged, never included in error messages, and never exposed through the API without explicit authorization.

### Layer 4: Certificate Transparency Monitoring

The [certificate transparency](@/glossary/certificate-transparency.md) monitoring subsystem within Prismatic Perimeter tracks certificate issuance for monitored domains, detecting unauthorized certificate creation that could enable man-in-the-middle attacks.

### Encryption in the Quality System

The platform's [enforcement policy](@/glossary/enforcement-policy.md) includes encryption-specific rules:

- Hardcoded secrets are blocked by pre-commit hooks (Phase 3)
- Credential files (`.env`, `credentials.json`) are in `.gitignore`
- All HTTP connections in production code must use HTTPS (enforced by Credo checks)
- Weak cipher suites and deprecated TLS versions are flagged during code review

## Comparison with Alternatives

### Encryption Approaches

| Approach | Strength | Weakness | Prismatic Usage |
|----------|----------|----------|-----------------|
| **AES-256-GCM** | Industry standard, hardware acceleration | Key management complexity | Primary symmetric cipher |
| **ChaCha20-Poly1305** | Fast on ARM/mobile, constant-time | Less hardware support | TLS fallback cipher |
| **RSA-4096** | Well-understood, wide support | Large keys, slow | Legacy compatibility |
| **X25519 + Ed25519** | Small keys, fast, modern | Newer, less audited | TLS 1.3 key exchange |
| **Application-level** | Granular control, defense in depth | Implementation complexity | Column-level via Cloak |
| **Database-level** | Transparent to application | Coarser granularity | PostgreSQL TDE |

### Language-Level Comparison

| Language/Runtime | Encryption Support | Prismatic Advantage |
|-----------------|-------------------|---------------------|
| **Elixir/BEAM** | `:crypto` (OpenSSL wrapper) | Direct C-level performance, OTP integration |
| **Node.js** | `crypto` module | Similar OpenSSL wrapper but single-threaded |
| **Go** | `crypto/` stdlib | Strong stdlib but no BEAM fault isolation |
| **Rust** | `ring`, `rustls` | Memory-safe but more manual key lifecycle |
| **Python** | `cryptography` | Comprehensive but GIL-limited for concurrent ops |

The BEAM's advantage is not in raw encryption speed (all wrap the same OpenSSL primitives) but in the ability to manage thousands of concurrent encrypted connections through lightweight processes with automatic fault recovery.

## Best Practices

### Key Management

1. **Never Hardcode Keys**: Use environment variables or vault services. The Prismatic pre-commit hook detects hardcoded secrets and blocks the commit.

2. **Rotate Keys Regularly**: Implement automated key rotation with overlap periods where both old and new keys are valid, allowing in-flight data to be decrypted with the previous key.

3. **Use Authenticated Encryption**: Always prefer AEAD modes (AES-GCM, ChaCha20-Poly1305) that provide both confidentiality and integrity. Unauthenticated encryption is vulnerable to padding oracle attacks.

4. **Separate Keys by Purpose**: Use distinct keys for transport encryption, data-at-rest encryption, and credential encryption. Compromise of one key should not expose all data.

5. **Secure Key Derivation**: When deriving keys from passwords, use memory-hard KDFs (Argon2id) with appropriate parameters. Never use raw hashing (SHA-256) as a KDF.

### Implementation

1. **Use Established Libraries**: Never implement custom cryptographic algorithms. Use `:crypto`, `Plug.Crypto`, and `Cloak` for Elixir encryption needs.

2. **Generate IVs/Nonces Properly**: Use `:crypto.strong_rand_bytes/1` for initialization vectors. Never reuse an IV with the same key -- this catastrophically breaks AES-GCM security.

3. **Handle Errors Explicitly**: Decryption failures should return `{:error, reason}`, never raise exceptions that might leak key material or plaintext in stack traces.

4. **Log Encrypted Operations, Not Data**: Log that encryption occurred, the algorithm used, and the key ID -- never log the key, plaintext, or full ciphertext.

## Common Pitfalls

### ECB Mode Usage

Electronic Codebook (ECB) mode encrypts each block independently, producing identical ciphertext for identical plaintext blocks. This leaks patterns in the data. Always use authenticated modes like GCM or CCM.

### Nonce Reuse

Reusing a nonce (number used once) with the same key in AES-GCM reveals the XOR of the two plaintexts and allows authentication tag forgery. This is a catastrophic failure. Use random nonces from `:crypto.strong_rand_bytes/1` and ensure nonce uniqueness through counters or random generation with sufficient entropy.

### Insufficient Key Entropy

Deriving encryption keys from short passwords without proper KDF produces weak keys vulnerable to brute-force attacks. Always use Argon2id, bcrypt, or PBKDF2 with high iteration counts.

### Timing Side Channels

Comparing MACs or authentication tags using standard `==` is vulnerable to timing attacks. Use constant-time comparison functions like `Plug.Crypto.secure_compare/2` or `:crypto.hash_equals/2`.

### Encrypting Without Authenticating

Encryption without authentication (MAC) allows attackers to modify ciphertext without detection. This enables chosen-ciphertext attacks. AEAD ciphers (AES-GCM, ChaCha20-Poly1305) solve this by combining encryption and authentication.

### Ignoring Certificate Validation

Disabling TLS certificate verification (setting `verify: :verify_none`) to "fix" connection errors eliminates the protection TLS provides against man-in-the-middle attacks. Always verify certificates against a trusted CA bundle.

## Use Cases

### Secure OSINT Data Collection

When Prismatic's 120 OSINT tools collect data from external sources, all connections use TLS with certificate pinning for critical sources. Collected intelligence data is encrypted at rest in PostgreSQL, ensuring that database compromise does not expose raw intelligence.

### Multi-Tenant Data Isolation

In scenarios where the platform processes data for multiple clients, per-tenant encryption keys ensure that data from one tenant cannot be decrypted by another, even by a database administrator with direct table access.

### Credential Rotation in Agent Operations

The 530+ [AIAD agents](@/glossary/agent.md) that interact with external services require API credentials. The credential vault encrypts these credentials and supports zero-downtime rotation, allowing agents to seamlessly transition to new credentials without service interruption.

### Compliance-Driven Encryption

NIS2 and ZKB compliance requirements mandate encryption for personal data processing. The Prismatic Perimeter's compliance assessment module verifies that monitored organizations meet these encryption requirements, while the platform itself demonstrates compliance through its own encryption implementation.

## Related Concepts

Encryption integrates with numerous security and platform concepts:

- [Encryption at Rest](@/glossary/encryption-at-rest.md) -- Applying encryption to stored data, complementing transport encryption
- [TLS](@/glossary/tls.md) -- Transport Layer Security protocol for encrypted network communication
- [Authentication](@/glossary/authentication.md) -- Verifying identity, often using cryptographic mechanisms
- [Security Operations](@/glossary/security-operations.md) -- The operational framework for managing encryption infrastructure
- [Certificate Transparency](@/glossary/certificate-transparency.md) -- Monitoring certificate issuance to prevent PKI abuse
- [Credential Management](@/glossary/credential-management.md) -- Secure storage and rotation of encrypted credentials
- [Authorization](@/glossary/authorization.md) -- Access control that determines who can decrypt what data
- [Audit Trail](@/glossary/audit-trail.md) -- Logging encryption operations for compliance and forensics
- [Policy](@/glossary/policy.md) -- Governance rules that mandate encryption standards
- [Attack Surface](@/glossary/attack-surface.md) -- The exposure that encryption helps minimize

## See Also

- Glossary Index -- Complete glossary of Prismatic Platform terminology
- [Enforcement Policy](@/glossary/enforcement-policy.md) -- How encryption standards are enforced across the platform
- [No Mercy No Doubts](@/glossary/no-mercy-no-doubts.md) -- The doctrine that mandates zero tolerance for encryption shortcuts
- [Quality Gate](@/glossary/quality-gate.md) -- Automated checks that verify encryption compliance
- [Formal Verification](@/glossary/formal-verification.md) -- Proving encryption implementations are correct

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
