+++
title = "Cipher Suite"
weight = 50
[extra]
description = "A named combination of cryptographic algorithms used in TLS/SSL connections, specifying the key exchange, bulk encryption, MAC, and PRF algorithms"
category = "security"
related_terms = ["aes", "authentication", "certificate-transparency", "credential", "attack-surface"]
complexity_level = "advanced"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["cipher suite", "TLS", "SSL", "cryptography", "ECDHE", "AES-GCM", "security", "glossary", "Prismatic Platform"]
tags = ["glossary", "security", "cryptography"]
quality_score = 78
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Cipher Suite - Prismatic Platform"
+++

## Definition & Overview

A cipher suite is a standardized combination of cryptographic algorithms that together define the security parameters for a TLS (Transport Layer Security) or SSL (Secure Sockets Layer) connection. Each cipher suite specifies four algorithmic components: the key exchange algorithm (how the shared secret is established), the authentication algorithm (how the server proves its identity), the bulk encryption algorithm (how data is encrypted in transit), and the message authentication code or MAC (how data integrity is verified).

Cipher suites are identified by standardized names following the format `TLS_KeyExchange_WITH_BulkEncryption_MAC`. For example, `TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384` uses Elliptic Curve Diffie-Hellman Ephemeral for key exchange, RSA for authentication, AES-256 in GCM mode for encryption, and SHA-384 for integrity. TLS 1.3 simplified this naming by removing the key exchange and authentication components from the suite name, as these are now negotiated separately.

In the Prismatic Platform, cipher suite configuration and assessment are critical from two perspectives: securing the platform's own HTTPS endpoints (via Fly.io TLS termination and Phoenix endpoint configuration) and assessing external cipher suite configurations through the Perimeter EASM module's security rating engine. Weak cipher suites discovered during external attack surface assessment directly impact an organization's security grade.

## Technical Deep Dive

### Cipher Suite Components (TLS 1.2)

| Component | Purpose | Strong Options | Weak Options |
|-----------|---------|---------------|--------------|
| **Key Exchange** | Establish shared secret | ECDHE, DHE | RSA (no PFS), DH |
| **Authentication** | Verify server identity | ECDSA, RSA (2048+) | RSA (1024), DSA |
| **Bulk Encryption** | Encrypt data stream | AES-256-GCM, ChaCha20-Poly1305 | RC4, DES, 3DES |
| **MAC** | Data integrity | SHA-384, SHA-256 | MD5, SHA-1 |

### TLS 1.3 Cipher Suites (Recommended)

| Suite | Key Exchange | Encryption | Hash |
|-------|-------------|------------|------|
| `TLS_AES_256_GCM_SHA384` | Negotiated separately | AES-256-GCM | SHA-384 |
| `TLS_AES_128_GCM_SHA256` | Negotiated separately | AES-128-GCM | SHA-256 |
| `TLS_CHACHA20_POLY1305_SHA256` | Negotiated separately | ChaCha20-Poly1305 | SHA-256 |

### Erlang/OTP TLS Configuration

```elixir
defmodule PrismaticWeb.TLSConfig do
  @moduledoc """
  TLS cipher suite configuration for the Prismatic Platform.
  Enforces modern cipher suites with forward secrecy.
  Applied to Phoenix endpoint and inter-node Erlang distribution.
  """

  @spec recommended_ciphers() :: [:ssl.ciphers()]
  def recommended_ciphers do
    # TLS 1.3 suites (preferred)
    tls13 = [
      %{cipher: :aes_256_gcm, key_exchange: :any, mac: :aead, prf: :sha384},
      %{cipher: :aes_128_gcm, key_exchange: :any, mac: :aead, prf: :sha256},
      %{cipher: :chacha20_poly1305, key_exchange: :any, mac: :aead, prf: :sha256}
    ]

    # TLS 1.2 suites (fallback)
    tls12 = [
      %{cipher: :aes_256_gcm, key_exchange: :ecdhe_ecdsa, mac: :aead, prf: :sha384},
      %{cipher: :aes_256_gcm, key_exchange: :ecdhe_rsa, mac: :aead, prf: :sha384},
      %{cipher: :aes_128_gcm, key_exchange: :ecdhe_ecdsa, mac: :aead, prf: :sha256},
      %{cipher: :aes_128_gcm, key_exchange: :ecdhe_rsa, mac: :aead, prf: :sha256}
    ]

    tls13 ++ tls12
  end

  @spec endpoint_ssl_options() :: keyword()
  def endpoint_ssl_options do
    [
      versions: [:"tlsv1.3", :"tlsv1.2"],
      ciphers: recommended_ciphers(),
      honor_cipher_order: true,
      secure_renegotiate: true,
      reuse_sessions: true,
      client_renegotiation: false
    ]
  end

  @spec distribution_ssl_options() :: keyword()
  def distribution_ssl_options do
    [
      versions: [:"tlsv1.3"],
      ciphers: Enum.take(recommended_ciphers(), 3),
      verify: :verify_peer,
      depth: 2
    ]
  end
end
```

### Cipher Suite Assessment Scoring

```elixir
defmodule PrismaticPerimeter.CipherSuiteAssessor do
  @moduledoc """
  Scores cipher suite configurations discovered during EASM scans.
  Part of the Perimeter security rating engine.
  """

  @type assessment :: %{
    score: 0..100,
    grade: :a | :b | :c | :d | :f,
    findings: [String.t()],
    recommendations: [String.t()]
  }

  @weak_ciphers ~w(RC4 DES 3DES EXPORT NULL)
  @weak_protocols ~w(SSLv2 SSLv3 TLSv1.0 TLSv1.1)

  @spec assess(map()) :: {:ok, assessment()}
  def assess(tls_scan_result) do
    score = 100

    {score, findings} =
      score
      |> deduct_weak_ciphers(tls_scan_result.cipher_suites)
      |> deduct_weak_protocols(tls_scan_result.protocols)
      |> deduct_missing_pfs(tls_scan_result.cipher_suites)
      |> deduct_short_keys(tls_scan_result.key_length)

    grade = score_to_grade(score)

    {:ok, %{score: max(score, 0), grade: grade, findings: findings, recommendations: []}}
  end

  defp deduct_weak_ciphers({score, findings}, suites) do
    weak = Enum.filter(suites, fn s -> Enum.any?(@weak_ciphers, &String.contains?(s, &1)) end)

    case weak do
      [] -> {score, findings}
      found -> {score - length(found) * 15, ["Weak ciphers: #{Enum.join(found, ", ")}" | findings]}
    end
  end

  defp deduct_weak_protocols({score, findings}, protocols) do
    weak = Enum.filter(protocols, &(&1 in @weak_protocols))

    case weak do
      [] -> {score, findings}
      found -> {score - length(found) * 20, ["Weak protocols: #{Enum.join(found, ", ")}" | findings]}
    end
  end

  defp deduct_missing_pfs({score, findings}, suites) do
    pfs_suites = Enum.filter(suites, &(String.contains?(&1, "ECDHE") or String.contains?(&1, "DHE")))

    if length(pfs_suites) == 0 do
      {score - 25, ["No forward secrecy support" | findings]}
    else
      {score, findings}
    end
  end

  defp deduct_short_keys({score, findings}, key_length) when key_length < 2048 do
    {score - 20, ["Key length #{key_length} below 2048-bit minimum" | findings]}
  end

  defp deduct_short_keys(result, _), do: result

  defp score_to_grade(score) when score >= 90, do: :a
  defp score_to_grade(score) when score >= 75, do: :b
  defp score_to_grade(score) when score >= 60, do: :c
  defp score_to_grade(score) when score >= 40, do: :d
  defp score_to_grade(_), do: :f
end
```

## Architecture & Implementation

The Prismatic Platform handles cipher suites at three architectural layers. At the edge layer, Fly.io terminates TLS connections using its managed certificate infrastructure, providing modern cipher suite support without platform-level certificate management. At the application layer, Phoenix endpoints can be configured with explicit cipher suite preferences for scenarios requiring end-to-end TLS (inter-service communication). At the Erlang distribution layer, inter-node communication uses TLS 1.3 exclusively with the tightest cipher suite selection.

The Perimeter EASM module actively scans external cipher suite configurations as part of its attack surface assessment. When evaluating a target domain, the scanner enumerates supported cipher suites and protocols, scoring each against current best practices. This score feeds directly into the organization's security rating (A-F grade, 300-900 numeric score).

## Usage in Prismatic Platform

The OSINT toolbox includes cipher suite assessment capabilities through global adapters like Shodan and Censys, which provide TLS configuration data for discovered hosts. The platform cross-references discovered cipher suites against known vulnerability databases (CVE) to identify exploitable configurations.

The Blue Team's drift-detector agent monitors cipher suite configurations across the platform's infrastructure, alerting when configurations deviate from the established baseline. Configuration drift in TLS settings is treated as a high-severity finding due to the potential for downgrade attacks.

NIS2 compliance (Article 21) mandates appropriate encryption measures, and the Perimeter compliance engine verifies that assessed organizations meet minimum cipher suite requirements. ZKB 264/2025 similarly requires state-of-the-art encryption for entities operating under Czech cybersecurity law.

## Cross-References

- [AES](/glossary/aes/) - primary bulk encryption algorithm in modern cipher suites
- [Authentication](/glossary/authentication/) - server identity verification in TLS
- [Certificate Transparency](/glossary/certificate-transparency/) - TLS certificate monitoring
- **Credential** - certificates used in TLS authentication
- [Attack Surface](/glossary/attack-surface/) - weak cipher suites expand attack surface
- **Livebooks**: `livebooks/domains/security_compliance/` - TLS assessment exercises
- **Perimeter**: Security rating engine cipher suite scoring

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
