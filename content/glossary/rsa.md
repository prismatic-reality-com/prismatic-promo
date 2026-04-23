+++
title = "RSA"
weight = 50

[extra]
description = "Rivest-Shamir-Adleman asymmetric cryptographic algorithm used for secure key exchange, digital signatures, and encryption, foundational to TLS and JWT token signing."
category = "security"
domain = "cryptography"
complexity = "advanced"
stability = "stable"
beam_related = true
related_terms = ["token", "tls", "spf", "secrets", "zero-trust", "jwt", "authentication", "authorization", "aes", "api-gateway", "audit-trail", "access-control"]
tags = ["rsa", "cryptography", "encryption", "digital-signatures", "tls", "jwt", "security", "asymmetric", "public-key", "padding", "oaep", "pss", "post-quantum", "erlang-crypto", "dkim", "osint"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "advanced"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "RSA provides the asymmetric cryptography foundation for JWT signing, TLS certificates, and secure key exchange in Prismatic Platform's authentication infrastructure."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["RSA", "cryptography", "encryption", "digital signatures", "OAEP", "PSS", "PKCS", "post-quantum", "CRYSTALS-Dilithium", "Erlang crypto", "glossary", "Prismatic Platform"]
image = "/images/sections/glossary.png"
image_alt = "RSA - Prismatic Platform"
word_count = 3500
see_also = ["capabilities", "architecture", "authentication", "security"]
+++

## Definition

**RSA** (Rivest-Shamir-Adleman) is an asymmetric cryptographic algorithm that uses a pair of mathematically related keys: a public key for encryption and a private key for decryption (or vice versa for digital signatures). Published in 1977, RSA remains one of the most widely deployed public-key cryptosystems, underpinning TLS/SSL certificates, SSH authentication, JWT token signing, and PGP email encryption.

RSA's security relies on the computational difficulty of factoring the product of two large prime numbers. While multiplying two 1024-bit primes takes microseconds, factoring their 2048-bit product is computationally infeasible with classical computers. Current recommendations specify a minimum key length of 2048 bits, with 4096 bits for long-term security. The increasing power of quantum computers poses a future threat to RSA, motivating the transition to post-quantum cryptographic algorithms standardized by NIST.

In the Prismatic Platform, RSA is the foundation of the authentication infrastructure: JWT tokens are signed with RS256, TLS certificates secure all HTTPS communication, and OSINT investigations analyze DKIM/SPF records that rely on RSA signatures for email authentication verification.

## Core Concepts

### Asymmetric vs Symmetric Cryptography

| Property | Asymmetric (RSA) | Symmetric (AES) |
|----------|------------------|------------------|
| Key count | 2 (public + private) | 1 (shared secret) |
| Key distribution | Public key is shareable | Secret must be pre-shared |
| Speed | Slow (~1000x slower) | Fast (hardware-accelerated) |
| Key size for 128-bit security | 3072 bits | 128 bits |
| Primary use | Key exchange, signatures | Bulk encryption |
| BEAM support | `:public_key` module | `:crypto` module |

### RSA Operations Overview

| Operation | Input | Output | Use Case |
|-----------|-------|--------|----------|
| **Key Generation** | Key size (bits) | Public key + Private key | Initial setup |
| **Encryption** | Plaintext + Public key | Ciphertext | Confidentiality |
| **Decryption** | Ciphertext + Private key | Plaintext | Message recovery |
| **Signing** | Message + Private key | Signature | Authenticity + integrity |
| **Verification** | Message + Signature + Public key | Boolean | Signature validation |

### Key Size Comparison

| Key Size | Security Level (bits) | Status (2026) | Factoring Difficulty | Use Case |
|----------|----------------------|---------------|---------------------|----------|
| 1024 | ~80 | **BROKEN** - do not use | Feasible with modern hardware | Legacy systems only |
| 2048 | ~112 | Minimum acceptable | Infeasible classically | Short-term keys, JWT |
| 3072 | ~128 | Recommended | Infeasible classically | Medium-term certificates |
| 4096 | ~152 | Long-term secure | Infeasible classically | CA certificates, long-lived keys |
| 7680 | ~192 | Maximum practical | Extreme | Ultra-high security |
| 15360 | ~256 | Impractical (too slow) | Theoretical | Not used in practice |

## Technical Deep Dive

### Key Generation Process

RSA key generation is a multi-step process requiring cryptographically secure random number generation:

1. **Select two large random primes** (p, q) of approximately equal bit length. For a 2048-bit key, each prime is ~1024 bits. Primality is verified using the Miller-Rabin probabilistic test (typically 40+ rounds for negligible error probability).

2. **Compute the modulus** n = p * q. This is the shared component of both public and private keys. The bit length of n is the "key size."

3. **Compute Euler's totient** phi(n) = (p-1)(q-1). In practice, the Carmichael function lambda(n) = lcm(p-1, q-1) is used for a smaller (and equally valid) private exponent.

4. **Choose the public exponent** e. The standard choice is 65537 (0x10001), which has only two bits set, making modular exponentiation fast. It must satisfy gcd(e, phi(n)) = 1.

5. **Compute the private exponent** d = e^(-1) mod lambda(n) using the extended Euclidean algorithm. The private key is (n, d).

6. **Store CRT parameters** for efficient decryption: dp = d mod (p-1), dq = d mod (q-1), qinv = q^(-1) mod p. CRT decryption is ~4x faster than naive decryption.

### Padding Schemes

Raw RSA (textbook RSA) is insecure -- it is deterministic and vulnerable to chosen-ciphertext attacks. All practical RSA usage requires padding:

| Padding Scheme | Standard | Purpose | Security | Status |
|---------------|----------|---------|----------|--------|
| **PKCS#1 v1.5 (encryption)** | RFC 8017 | Legacy encryption padding | Vulnerable to Bleichenbacher | Deprecated for new systems |
| **PKCS#1 v1.5 (signature)** | RFC 8017 | Legacy signature padding | Vulnerable to Bleichenbacher-variant | Still used (RS256 JWT) |
| **OAEP** (Optimal Asymmetric Encryption Padding) | RFC 8017 | Modern encryption padding | Provably secure (random oracle) | Recommended |
| **PSS** (Probabilistic Signature Scheme) | RFC 8017 | Modern signature padding | Provably secure (random oracle) | Recommended |

**OAEP** adds randomness to encryption, making it non-deterministic. The same plaintext encrypted twice produces different ciphertexts, preventing pattern analysis. OAEP uses two hash functions (typically SHA-256) and a mask generation function (MGF1).

**PSS** adds randomness to signatures, providing a tighter security proof than PKCS#1 v1.5 signatures. PSS signatures on the same message differ each time, which is acceptable because verification still works with the public key.

### JWT RS256 Integration

RS256 (RSA Signature with SHA-256) is the recommended JWT signing algorithm for multi-service architectures:

```
JWT Header:  {"alg": "RS256", "typ": "JWT", "kid": "key-2026-04"}
JWT Payload: {"sub": "user123", "iss": "prismatic", "exp": 1712000000}
JWT Signature: RSA-PKCS1v15-Sign(SHA256(header.payload), private_key)
```

**Why RS256 over HS256:**

| Aspect | HS256 (HMAC-SHA256) | RS256 (RSA-SHA256) |
|--------|--------------------|--------------------|
| Key type | Shared secret | Asymmetric (public/private) |
| Who can sign | Anyone with the secret | Only the private key holder |
| Who can verify | Anyone with the secret | Anyone with the public key |
| Key distribution | Must be kept secret everywhere | Public key is freely distributable |
| Multi-service | All services share the secret | Services only need the public key |
| Key rotation | Must update all services simultaneously | Only update the signing service |

### TLS Handshake Role

RSA participates in TLS in two ways:

1. **Certificate authentication**: The server presents an X.509 certificate containing its RSA public key, signed by a Certificate Authority's RSA private key. The client verifies the chain up to a trusted root CA.

2. **Key exchange** (legacy RSA key exchange): The client encrypts a pre-master secret with the server's RSA public key. Only the server can decrypt it. This mode lacks forward secrecy and is deprecated in TLS 1.3 in favor of ECDHE.

In TLS 1.3, RSA is used only for certificate signatures, not key exchange. Key exchange uses Diffie-Hellman (ECDHE), providing forward secrecy.

### Post-Quantum Migration

Shor's algorithm on a sufficiently large quantum computer can factor RSA keys in polynomial time, breaking RSA completely. NIST has standardized post-quantum replacements:

| Algorithm | Type | Key Size | Signature Size | Status |
|-----------|------|----------|---------------|--------|
| **CRYSTALS-Dilithium** (ML-DSA) | Lattice-based signatures | 1312-2592 bytes | 2420-4627 bytes | NIST standard (FIPS 204) |
| **CRYSTALS-Kyber** (ML-KEM) | Lattice-based key exchange | 800-1568 bytes | 768-1568 bytes | NIST standard (FIPS 203) |
| **SPHINCS+** (SLH-DSA) | Hash-based signatures | 32-64 bytes | 7856-49856 bytes | NIST standard (FIPS 205) |
| **FALCON** | Lattice-based signatures | 897-1793 bytes | 666-1280 bytes | NIST round 4 |

Migration timeline for Prismatic Platform:
- **2026-2027**: Hybrid mode -- RSA + post-quantum in parallel for certificates
- **2027-2028**: Post-quantum-only for new deployments
- **2028+**: Phase out RSA entirely for key exchange and signatures

### Erlang :crypto and :public_key Modules

Elixir applications access RSA through Erlang's `:crypto` and `:public_key` modules, which are backed by OpenSSL (or LibreSSL). These provide hardware-accelerated operations on platforms with AES-NI and SHA extensions.

Key functions:
- `:public_key.generate_key({:rsa, bits, exponent})` -- generate RSA key pair
- `:public_key.sign(message, hash_algo, private_key)` -- create signature
- `:public_key.verify(message, hash_algo, signature, public_key)` -- verify signature
- `:public_key.encrypt_public(plaintext, public_key)` -- encrypt with public key
- `:public_key.decrypt_private(ciphertext, private_key)` -- decrypt with private key
- `:public_key.pem_encode/1` and `:public_key.pem_decode/1` -- PEM format conversion

## Advanced Topics

### DKIM/SPF Analysis in OSINT

DKIM (DomainKeys Identified Mail) uses RSA signatures to authenticate email senders. The sending mail server signs email headers and body with its private RSA key. The corresponding public key is published in DNS as a TXT record. Recipients verify the signature using this DNS-published key.

OSINT investigators use DKIM analysis to:
- Verify email authenticity in phishing investigations
- Map an organization's email infrastructure through DNS record analysis
- Detect email spoofing by checking DKIM signature validity
- Identify weak DKIM keys (< 2048 bits) as security vulnerabilities

SPF (Sender Policy Framework) does not use RSA directly but is complementary -- it specifies which IP addresses are authorized to send email for a domain. Together, SPF + DKIM + DMARC provide email authentication that OSINT tools analyze.

### Side-Channel Attacks

RSA implementations must defend against timing attacks, where an attacker measures how long decryption/signing takes to infer the private key:

| Attack | Vector | Countermeasure |
|--------|--------|---------------|
| Timing attack | Measure decryption time | Constant-time modular exponentiation |
| Power analysis | Measure power consumption | Randomized blinding |
| Fault injection | Induce computation errors | CRT signature verification |
| Cache timing | Measure cache hit patterns | Scatter-gather memory access |

OpenSSL (used by Erlang `:crypto`) implements these countermeasures, but application-level code must still avoid branching on secret data.

### Key Rotation Strategy

For JWT signing keys, rotation should follow a key lifecycle:

1. **Generation**: Create new key pair, assign a unique `kid` (key ID)
2. **Publication**: Add public key to JWKS (JSON Web Key Set) endpoint
3. **Activation**: Start signing new tokens with the new key
4. **Overlap**: Both old and new keys are valid for verification (token lifetime overlap)
5. **Deprecation**: Stop accepting tokens signed with the old key
6. **Destruction**: Securely delete the old private key

## Usage in Prismatic Platform

The platform uses RSA in several authentication and security contexts:

**JWT Token Signing**: JWT tokens issued by the API gateway are signed with RS256 (RSA-SHA256), allowing any service with the public key to verify token authenticity without access to the signing secret. The JWKS endpoint publishes current and recent public keys for multi-service verification.

**TLS Certificates**: TLS certificates for `prismatic-prod.fly.dev` use RSA key pairs (currently 2048-bit, migration to ECDSA planned) for HTTPS encryption. Fly.io manages certificate issuance and renewal through Let's Encrypt.

**OSINT Email Intelligence**: SPF and DKIM records for email authentication use RSA signatures to verify email sender authenticity. The OSINT email intelligence tools analyze these records during investigations, extracting RSA public keys from DNS TXT records and validating DKIM signatures on collected email samples.

**SSH Deployment Keys**: GitLab CI/CD deployment uses RSA SSH keys for secure repository access and deployment authentication. Key size is 4096 bits for deployment keys.

## Code Examples

```elixir
defmodule PrismaticAuth.RSA do
  @moduledoc """
  RSA key operations for JWT signing and verification.
  Uses Erlang's :public_key module backed by OpenSSL.

  Provides key generation, signing, verification, and key
  rotation support for the platform's authentication infrastructure.

  ## Security Notes

  - Minimum key size enforced at 2048 bits
  - Private keys must never be logged or serialized to responses
  - Key rotation is supported via key ID (kid) tracking
  - All operations use constant-time implementations via OpenSSL

  ## Examples

      {:ok, keys} = PrismaticAuth.RSA.generate_keypair(2048)
      {:ok, signature} = PrismaticAuth.RSA.sign("hello", keys.private)
      true = PrismaticAuth.RSA.verify("hello", signature, keys.public)
  """

  require Logger

  @minimum_key_bits 2048

  @doc """
  Generate an RSA key pair with the specified bit length.

  The public exponent is fixed at 65537 (standard choice).
  Returns PEM-encoded keys suitable for file storage or
  environment variable configuration.

  ## Parameters

    - `bits` - Key size in bits. Minimum 2048, recommended 4096 for long-term use.

  ## Examples

      iex> {:ok, keys} = PrismaticAuth.RSA.generate_keypair(2048)
      iex> is_binary(keys.public) and is_binary(keys.private)
      true

  """
  @spec generate_keypair(pos_integer()) :: {:ok, %{public: binary(), private: binary()}}
  def generate_keypair(bits \\ 2048) when bits >= @minimum_key_bits do
    private_key = :public_key.generate_key({:rsa, bits, 65_537})

    private_pem =
      :public_key.pem_encode([
        :public_key.pem_entry_encode(:RSAPrivateKey, private_key)
      ])

    public_key = extract_public_key(private_key)

    public_pem =
      :public_key.pem_encode([
        :public_key.pem_entry_encode(:SubjectPublicKeyInfo, public_key)
      ])

    Logger.info("RSA keypair generated", key_bits: bits)
    {:ok, %{public: public_pem, private: private_pem}}
  end

  @doc """
  Sign a message with an RSA private key using SHA-256.

  Returns a Base64-encoded signature suitable for JWT or
  API authentication headers.

  ## Parameters

    - `message` - The binary message to sign
    - `private_pem` - PEM-encoded RSA private key

  ## Examples

      iex> {:ok, keys} = PrismaticAuth.RSA.generate_keypair()
      iex> {:ok, sig} = PrismaticAuth.RSA.sign("test message", keys.private)
      iex> is_binary(sig)
      true
  """
  @spec sign(binary(), binary()) :: {:ok, binary()} | {:error, term()}
  def sign(message, private_pem) when is_binary(message) and is_binary(private_pem) do
    [entry] = :public_key.pem_decode(private_pem)
    private_key = :public_key.pem_entry_decode(entry)
    signature = :public_key.sign(message, :sha256, private_key)
    {:ok, Base.encode64(signature)}
  rescue
    e in [MatchError] ->
      Logger.error("RSA sign failed: invalid PEM format",
        error: Exception.message(e)
      )
      {:error, {:invalid_key_format, Exception.message(e)}}

    e in [ArgumentError] ->
      Logger.error("RSA sign failed: invalid arguments",
        error: Exception.message(e)
      )
      {:error, {:sign_failed, Exception.message(e)}}
  end

  @doc """
  Verify an RSA-SHA256 signature against a message and public key.

  ## Parameters

    - `message` - The original message
    - `signature_b64` - Base64-encoded signature
    - `public_pem` - PEM-encoded RSA public key

  ## Examples

      iex> {:ok, keys} = PrismaticAuth.RSA.generate_keypair()
      iex> {:ok, sig} = PrismaticAuth.RSA.sign("test", keys.private)
      iex> PrismaticAuth.RSA.verify("test", sig, keys.public)
      true

      iex> {:ok, keys} = PrismaticAuth.RSA.generate_keypair()
      iex> {:ok, sig} = PrismaticAuth.RSA.sign("test", keys.private)
      iex> PrismaticAuth.RSA.verify("tampered", sig, keys.public)
      false
  """
  @spec verify(binary(), binary(), binary()) :: boolean()
  def verify(message, signature_b64, public_pem) do
    [entry] = :public_key.pem_decode(public_pem)
    public_key = :public_key.pem_entry_decode(entry)
    signature = Base.decode64!(signature_b64)
    :public_key.verify(message, :sha256, signature, public_key)
  end

  @doc """
  Extract RSA key metadata for JWKS endpoint publication.

  Returns the modulus and exponent in Base64url format suitable
  for a JSON Web Key Set response.

  ## Parameters

    - `public_pem` - PEM-encoded RSA public key
    - `kid` - Key ID for rotation tracking

  ## Examples

      iex> {:ok, keys} = PrismaticAuth.RSA.generate_keypair()
      iex> {:ok, jwk} = PrismaticAuth.RSA.to_jwk(keys.public, "key-2026-04")
      iex> jwk.kty
      "RSA"
  """
  @spec to_jwk(binary(), String.t()) :: {:ok, map()} | {:error, term()}
  def to_jwk(public_pem, kid) do
    [entry] = :public_key.pem_decode(public_pem)

    case :public_key.pem_entry_decode(entry) do
      {:RSAPublicKey, modulus, exponent} ->
        {:ok, %{
          kty: "RSA",
          kid: kid,
          use: "sig",
          alg: "RS256",
          n: Base.url_encode64(:binary.encode_unsigned(modulus), padding: false),
          e: Base.url_encode64(:binary.encode_unsigned(exponent), padding: false)
        }}

      _ ->
        {:error, :invalid_public_key}
    end
  end

  defp extract_public_key(private_key) do
    {:RSAPrivateKey, _, modulus, public_exp, _, _, _, _, _, _, _} = private_key
    {:RSAPublicKey, modulus, public_exp}
  end
end
```

```elixir
defmodule PrismaticOsint.DkimAnalyzer do
  @moduledoc """
  DKIM signature analysis for email authentication OSINT.

  Extracts and validates DKIM RSA public keys from DNS records,
  checks key strength, and identifies potential email spoofing
  vulnerabilities in investigated domains.

  ## OSINT Use Cases

  - Verify email authenticity in phishing investigations
  - Map organization email infrastructure through DNS analysis
  - Detect weak DKIM keys as security vulnerabilities
  - Cross-reference DKIM selectors across related domains
  """

  require Logger

  @weak_key_threshold 1024

  @doc """
  Analyze DKIM configuration for a domain.

  Queries common DKIM selectors and evaluates RSA key strength.
  Returns a structured assessment of the domain's email authentication.
  """
  @spec analyze(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def analyze(domain, opts \\ []) do
    selectors = Keyword.get(opts, :selectors, default_selectors())

    results =
      selectors
      |> Enum.map(fn selector -> {selector, query_dkim(domain, selector)} end)
      |> Enum.filter(fn {_sel, result} -> result != :not_found end)
      |> Enum.map(fn {selector, {:ok, record}} ->
        %{
          selector: selector,
          key_bits: extract_key_bits(record),
          algorithm: extract_algorithm(record),
          weak: extract_key_bits(record) < @weak_key_threshold,
          raw_record: record
        }
      end)

    {:ok, %{
      domain: domain,
      dkim_records: results,
      selectors_found: length(results),
      has_weak_keys: Enum.any?(results, & &1.weak),
      assessment: assess_dkim_security(results)
    }}
  end

  defp default_selectors do
    ["default", "google", "selector1", "selector2", "k1", "s1", "mail", "dkim"]
  end

  defp query_dkim(domain, selector) do
    record_name = "#{selector}._domainkey.#{domain}"

    case :inet_res.lookup(String.to_charlist(record_name), :in, :txt) do
      [] -> :not_found
      [record | _] -> {:ok, List.to_string(record)}
    end
  end

  defp extract_key_bits(record) do
    case Regex.run(~r/p=([A-Za-z0-9+\/=]+)/, record) do
      [_, key_b64] ->
        case Base.decode64(key_b64) do
          {:ok, der} -> byte_size(der) * 8
          _ -> 0
        end
      _ -> 0
    end
  end

  defp extract_algorithm(record) do
    case Regex.run(~r/k=(\w+)/, record) do
      [_, algo] -> algo
      _ -> "rsa"
    end
  end

  defp assess_dkim_security([]), do: :no_dkim
  defp assess_dkim_security(records) do
    cond do
      Enum.any?(records, & &1.weak) -> :weak_keys_found
      Enum.all?(records, &(&1.key_bits >= 2048)) -> :strong
      true -> :acceptable
    end
  end
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Using 1024-bit RSA keys | Factoring is feasible; keys are broken | Minimum 2048-bit, prefer 4096-bit for long-term use |
| Textbook RSA without padding | Deterministic encryption, chosen-ciphertext attacks | Always use OAEP for encryption, PSS for signatures |
| Storing private keys in source code | Key compromise if repository is accessed | Use environment variables or secret managers (Vault, AWS KMS) |
| HS256 in multi-service JWT | Shared secret must be distributed to all verifiers | Use RS256 -- only the signer needs the private key |
| Not rotating keys | Single compromise exposes all historical tokens | Implement key rotation with `kid` header, overlap period |
| Encrypting large data with RSA | RSA is limited to (key_size - padding) bytes | Use hybrid encryption: RSA encrypts an AES key, AES encrypts data |
| Ignoring CRT optimization | Decryption/signing is 4x slower without CRT | Erlang's `:public_key` uses CRT automatically; verify in custom implementations |
| Not verifying padding on decrypt | Padding oracle attacks | Use OAEP with authenticated encryption, or sign-then-encrypt |
| No post-quantum migration plan | Future quantum computers break RSA | Plan hybrid certificates and monitor NIST PQC standards |
| String.to_atom for key identifiers | Atom table exhaustion from dynamic key IDs | Use `String.to_existing_atom/1` or keep key IDs as strings |

## Best Practices

1. **Use minimum 2048-bit keys** -- 1024-bit RSA is considered broken; 2048 is the minimum, 4096 recommended for long-term use and CA certificates.
2. **Never expose private keys** -- store in environment variables or secret managers, never in source code or configuration files. Log key events but never key material.
3. **Prefer RS256 over HS256 for JWT** -- asymmetric signing allows verification without sharing the signing secret, critical for microservice architectures.
4. **Rotate keys periodically** -- key rotation limits the impact of key compromise; support key IDs (`kid`) in JWT headers for graceful rotation with overlap periods.
5. **Plan for post-quantum migration** -- monitor NIST post-quantum standardization (FIPS 203/204/205) and plan transition to hybrid certificates by 2027.
6. **Use OAEP for encryption, PSS for signatures** -- legacy PKCS#1 v1.5 padding has known vulnerabilities; modern padding schemes provide provable security.
7. **Implement hybrid encryption** for large data -- RSA encrypts an AES-256-GCM key, and AES encrypts the actual payload.
8. **Validate certificate chains completely** -- verify the entire chain from leaf to trusted root, check revocation (OCSP/CRL), and validate hostname matching.
9. **Use constant-time operations** -- Erlang's `:crypto` module handles this, but custom implementations must avoid branching on secret data.
10. **Monitor DKIM key strength in OSINT** -- identify organizations using weak (< 2048-bit) DKIM keys as part of email infrastructure vulnerability assessments.

## Related Terms

- [Token](@/glossary/token.md) -- JWT tokens signed with RSA keys for authentication
- [JWT](@/glossary/jwt.md) -- JSON Web Token standard using RS256 signing
- [TLS](@/glossary/tls.md) -- Transport Layer Security using RSA for certificate authentication
- [SPF](@/glossary/spf.md) -- email authentication complementing RSA-based DKIM
- [Secrets](@/glossary/secrets.md) -- secure storage for RSA private keys
- [Zero Trust](@/glossary/zero-trust.md) -- security model where RSA enables identity verification
- [AES](@/glossary/aes.md) -- symmetric encryption used with RSA in hybrid schemes
- [Authentication](@/glossary/authentication.md) -- identity verification powered by RSA signatures
- [Authorization](@/glossary/authorization.md) -- access control enabled by RSA-signed tokens
- [API Gateway](@/glossary/api-gateway.md) -- gateway that validates RSA-signed JWT tokens
- [Audit Trail](@/glossary/audit-trail.md) -- cryptographic audit integrity via RSA signatures
- [Access Control](@/glossary/access-control.md) -- permission systems built on RSA-authenticated identity

## See Also

- [Authentication Architecture](@/architecture/_index.md) -- RSA-based token signing and verification
- [Security Capabilities](@/capabilities/_index.md) -- cryptographic infrastructure overview
- [OSINT Email Analysis](/hub/osint/tools) -- DKIM/SPF analysis tools
- [Erlang :public_key documentation](https://www.erlang.org/doc/man/public_key) -- BEAM cryptographic primitives

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
