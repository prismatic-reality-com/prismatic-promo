+++
title = "TLS"
weight = 44
[extra]
category = "security"
description = "Transport Layer Security protocol encrypting data in transit between client and server"
related_terms = ["encryption-at-rest", "oauth2", "jwt", "easm", "attack-surface", "api-gateway"]
acronym = "TLS"
full_name = "Transport Layer Security"
predecessor = "SSL (Secure Sockets Layer)"
current_version = "TLS 1.3 (RFC 8446)"
year_introduced = "1999 (TLS 1.0), 2018 (TLS 1.3)"
rfc = "RFC 8446"
layer = "Transport Layer (between TCP and application)"
paradigm = "Cryptographic Protocol"
difficulty = "Intermediate to Advanced"
cipher_suites_tls13 = ["TLS_AES_256_GCM_SHA384", "TLS_AES_128_GCM_SHA256", "TLS_CHACHA20_POLY1305_SHA256"]
handshake_rtt = "1 RTT (0-RTT for resumption)"
certificate_standard = "X.509"
certificate_authority = "Let's Encrypt (ACME protocol)"
prismatic_deployment = "Fly.io edge TLS termination"
prismatic_apps = ["prismatic_web", "prismatic_api", "prismatic_perimeter"]
easm_assessment_weight = "Critical"
compliance_frameworks = ["NIS2 Directive", "ZKB 264/2025"]
erlang_module = ":ssl"
platforms = ["BEAM", "Erlang/OTP", "Phoenix"]
key_exchange = ["ECDHE", "DHE"]
forward_secrecy = "Mandatory in TLS 1.3"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1485
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["TLS", "Transport", "Layer", "Security", "glossary", "Prismatic Platform", "Certificate", "ECDHE"]
tags = ["glossary", "security", "tls", "prismatic"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "TLS - Prismatic Platform"
+++

## Definition

Transport Layer Security (TLS) is a cryptographic protocol that provides privacy, data integrity, and authentication between communicating applications over a network. Operating at the transport layer (between TCP and application protocols like HTTP), TLS encrypts data in transit so that eavesdroppers see only ciphertext, authenticates the server (and optionally the client) via X.509 certificates, and ensures message integrity through cryptographic message authentication codes (MACs). TLS is the successor to SSL (Secure Sockets Layer) and is the foundation of HTTPS, securing virtually all modern web communication.

TLS 1.3, ratified as RFC 8446 in August 2018, represents a significant evolution of the protocol. It eliminates support for insecure cipher suites, reduces the handshake from two round trips to one (and zero for resumed connections via 0-RTT), removes vulnerable features like renegotiation and compression, and mandates forward secrecy for all cipher suites. These improvements make TLS 1.3 both faster and more secure than its predecessors, and it is the recommended minimum version for modern deployments.

In the context of security platforms performing External Attack Surface Management ([EASM](@/glossary/easm.md)), TLS configuration analysis is a critical assessment dimension. Weak TLS configurations -- outdated protocol versions, insecure cipher suites, expired certificates, missing certificate transparency logs -- are among the most common and most impactful vulnerabilities discovered during attack surface assessments. A platform's TLS posture directly affects its security rating and compliance standing.

## Historical Evolution

The evolution of TLS reflects two decades of cryptographic progress and attack discovery:

| Version | Year | Key Changes | Current Status |
|---------|------|-------------|----------------|
| SSL 2.0 | 1995 | First public release | Deprecated, insecure |
| SSL 3.0 | 1996 | Redesigned from SSL 2.0 | Deprecated (POODLE attack) |
| TLS 1.0 | 1999 | Renamed from SSL, minor changes | Deprecated since 2020 |
| TLS 1.1 | 2006 | Explicit IV, protection against CBC attacks | Deprecated since 2020 |
| TLS 1.2 | 2008 | AEAD cipher suites, SHA-256, extensibility | Widely deployed, still acceptable |
| TLS 1.3 | 2018 | 1-RTT handshake, mandatory PFS, reduced cipher suites | Current standard, recommended |

Each version addressed vulnerabilities discovered in its predecessor. The shift from TLS 1.2 to TLS 1.3 was particularly dramatic: rather than patching individual vulnerabilities, TLS 1.3 removed entire categories of features that had proven to be security liabilities (renegotiation, compression, non-AEAD ciphers, RSA key exchange).

## TLS 1.3 Protocol

TLS 1.3 simplifies the protocol significantly compared to TLS 1.2, removing entire categories of vulnerabilities by eliminating legacy features:

| Feature | TLS 1.2 | TLS 1.3 | Security Impact |
|---------|---------|---------|-----------------|
| **Handshake round trips** | 2 RTT | 1 RTT (0-RTT resumption) | Reduced latency |
| **Key exchange** | RSA, DHE, ECDHE | ECDHE, DHE only | Mandatory forward secrecy |
| **Cipher suites** | 37+ options | 5 options | Eliminated weak algorithms |
| **Compression** | Supported | Removed | Prevents CRIME/BREACH attacks |
| **Renegotiation** | Supported | Removed | Prevents renegotiation attacks |
| **Record padding** | Not available | Supported | Traffic analysis resistance |
| **0-RTT resumption** | Not available | Supported | Fast reconnection |
| **Encrypted handshake** | Certificate in plaintext | Certificate encrypted | Server identity protection |

### TLS 1.3 Cipher Suites

TLS 1.3 supports only five cipher suites, all providing authenticated encryption with associated data (AEAD):

| Cipher Suite | Key Exchange | Encryption | Hash | Status |
|-------------|-------------|------------|------|--------|
| `TLS_AES_256_GCM_SHA384` | ECDHE/DHE | AES-256-GCM | SHA-384 | Recommended |
| `TLS_AES_128_GCM_SHA256` | ECDHE/DHE | AES-128-GCM | SHA-256 | Recommended |
| `TLS_CHACHA20_POLY1305_SHA256` | ECDHE/DHE | ChaCha20-Poly1305 | SHA-256 | Recommended (mobile) |
| `TLS_AES_128_CCM_SHA256` | ECDHE/DHE | AES-128-CCM | SHA-256 | Optional |
| `TLS_AES_128_CCM_8_SHA256` | ECDHE/DHE | AES-128-CCM-8 | SHA-256 | IoT only |

## TLS Handshake

The TLS 1.3 handshake establishes a secure connection in a single round trip:

```
Client                                           Server

ClientHello
  + key_share
  + signature_algorithms
  + supported_versions    -------->
                                              ServerHello
                                              + key_share
                                    {EncryptedExtensions}
                                    {CertificateRequest*}
                                           {Certificate}
                                     {CertificateVerify}
                          <--------           {Finished}
{Certificate*}
{CertificateVerify*}
{Finished}                -------->
[Application Data]        <------->   [Application Data]
```

The key improvement over TLS 1.2 is that encrypted application data can begin flowing after just one round trip. The server's Certificate and CertificateVerify messages are encrypted (shown in `{}`), unlike TLS 1.2 where the server certificate was sent in plaintext, enabling passive observers to identify the server.

### 0-RTT Resumption

TLS 1.3 supports 0-RTT (zero round trip time) resumption for previously connected clients. The client sends application data alongside the ClientHello using a pre-shared key (PSK) from a previous session. This eliminates the handshake latency entirely for returning connections.

However, 0-RTT data is not protected against replay attacks -- an eavesdropper could capture and resend the 0-RTT data. Servers must therefore ensure that 0-RTT operations are idempotent or implement their own replay protection.

## Forward Secrecy

Forward secrecy (also called perfect forward secrecy, PFS) ensures that compromise of a server's long-term private key does not compromise past session keys. In TLS 1.3, forward secrecy is mandatory because only ephemeral key exchange algorithms (ECDHE, DHE) are supported.

```elixir
defmodule PrismaticPerimeter.TLS.ForwardSecrecyCheck do
  @moduledoc """
  Verifies that a target host supports forward secrecy.
  Part of the EASM TLS assessment pipeline.
  """

  @spec check_forward_secrecy(String.t(), pos_integer()) ::
    {:ok, :supported} | {:error, :not_supported | term()}
  def check_forward_secrecy(hostname, port \\ 443) do
    ecdhe_suites = [
      {:ecdhe_rsa, :aes_256_gcm, :aead, :sha384},
      {:ecdhe_rsa, :aes_128_gcm, :aead, :sha256},
      {:ecdhe_ecdsa, :aes_256_gcm, :aead, :sha384}
    ]

    ssl_opts = [
      verify: :verify_peer,
      cacerts: :public_key.cacerts_get(),
      ciphers: ecdhe_suites,
      server_name_indication: String.to_charlist(hostname)
    ]

    case :ssl.connect(String.to_charlist(hostname), port, ssl_opts, 10_000) do
      {:ok, socket} ->
        :ssl.close(socket)
        {:ok, :supported}
      {:error, _reason} ->
        {:error, :not_supported}
    end
  end
end
```

## Certificate Management

X.509 certificates are the trust anchors of TLS, binding a public key to a domain identity. Certificate management involves issuance, validation, renewal, and revocation:

| Aspect | Description | Best Practice |
|--------|-------------|---------------|
| **Issuance** | Obtaining a certificate from a Certificate Authority (CA) | Use ACME protocol (Let's Encrypt) for automation |
| **Validation** | Certificate chain verification against trusted CA roots | Validate full chain, check revocation (OCSP) |
| **Renewal** | Replacing certificates before expiration | Automate with 30-day pre-expiration renewal |
| **Revocation** | Invalidating compromised certificates | OCSP stapling preferred over CRL |
| **Transparency** | Public logging of issued certificates | Monitor CT logs for unauthorized issuance |
| **Key rotation** | Periodic replacement of private keys | Rotate with each renewal cycle |

```elixir
defmodule PrismaticPerimeter.TLS.CertificateAnalyzer do
  @moduledoc """
  Analyzes X.509 certificates for security assessment.
  Extracts validity, chain completeness, and compliance data.
  """

  @type cert_assessment :: %{
    subject: String.t(),
    issuer: String.t(),
    valid_from: DateTime.t(),
    valid_until: DateTime.t(),
    days_remaining: integer(),
    key_algorithm: String.t(),
    key_size: pos_integer(),
    signature_algorithm: String.t(),
    san_domains: [String.t()],
    chain_complete: boolean(),
    ct_logged: boolean()
  }

  @spec analyze(binary()) :: {:ok, cert_assessment()} | {:error, term()}
  def analyze(der_cert) do
    case :public_key.pkix_decode_cert(der_cert, :otp) do
      {:OTPCertificate, tbs, _, _} ->
        {:ok, extract_assessment(tbs)}
      _ ->
        {:error, :invalid_certificate}
    end
  end
end
```

## HTTPS Enforcement

HTTPS (HTTP over TLS) is the standard mechanism for securing web traffic. Proper HTTPS enforcement requires several complementary measures:

| Mechanism | Purpose | Implementation |
|-----------|---------|----------------|
| **HTTP-to-HTTPS redirect** | Force all traffic to encrypted channel | 301 redirect on port 80 |
| **HSTS** | Prevent protocol downgrade attacks | `Strict-Transport-Security` header |
| **HSTS Preload** | Browser-level HTTPS enforcement | Submit to HSTS preload list |
| **Certificate Transparency** | Public audit of certificate issuance | CT log monitoring |
| **OCSP Stapling** | Efficient certificate revocation checking | Server-side OCSP response caching |
| **CAA Records** | Restrict which CAs can issue certificates | DNS CAA record publication |

HTTP Strict Transport Security (HSTS) is particularly important because it instructs browsers to always use HTTPS for the domain, even if the user types `http://` or follows an HTTP link. The `max-age` directive specifies how long the browser should remember this preference, and `includeSubDomains` extends the policy to all subdomains.

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

## Context in Prismatic

The Prismatic Platform enforces TLS across all external communication paths. Production deployments on Fly.io terminate TLS at the edge with automatic certificate management via Let's Encrypt. The platform's [Phoenix](@/glossary/phoenix.md) endpoints are configured with `force_ssl: true`, redirecting all HTTP requests to HTTPS and setting HSTS headers with a two-year max-age.

```elixir
defmodule PrismaticWeb.Endpoint do
  @moduledoc "Phoenix endpoint with TLS enforcement configuration."
  use Phoenix.Endpoint, otp_app: :prismatic_web

  # Production TLS configuration
  # config/prod.exs
  # config :prismatic_web, PrismaticWeb.Endpoint,
  #   url: [host: "prismatic-prod.fly.dev", port: 443],
  #   https: [
  #     port: 4001,
  #     cipher_suite: :strong,
  #     versions: [:"tlsv1.3", :"tlsv1.2"],
  #     certfile: System.get_env("TLS_CERT_PATH"),
  #     keyfile: System.get_env("TLS_KEY_PATH"),
  #     cacertfile: System.get_env("TLS_CA_PATH")
  #   ],
  #   force_ssl: [
  #     hsts: true,
  #     rewrite_on: [:x_forwarded_proto]
  #   ]
end
```

Internally, the platform uses TLS for inter-service communication when services are distributed across nodes. The Erlang/OTP distribution protocol can be configured with TLS for cluster communication, ensuring that BEAM-level messages between nodes are encrypted in transit.

## EASM TLS Assessment

The Prismatic Perimeter [EASM](@/glossary/easm.md) module actively assesses TLS configurations of discovered [attack surface](@/glossary/attack-surface.md) assets, factoring certificate validity, protocol versions, cipher suite strength, and certificate transparency compliance into security ratings:

| Check | Weight | Finding Examples |
|-------|--------|------------------|
| **Protocol version** | High | TLS 1.0/1.1 present (critical), TLS 1.3 missing (warning) |
| **Certificate validity** | Critical | Expired certificate, wrong hostname, self-signed |
| **Certificate chain** | High | Incomplete chain, untrusted CA, missing intermediates |
| **Cipher suite strength** | High | RC4, DES, export-grade ciphers (critical) |
| **Forward secrecy** | Medium | Non-ECDHE key exchange (warning) |
| **HSTS configuration** | Medium | Missing HSTS, short max-age, missing preload |
| **Certificate transparency** | Low | Missing CT logs (informational) |
| **OCSP stapling** | Low | Missing OCSP staple (informational) |
| **CAA records** | Low | Missing DNS CAA records (informational) |

```elixir
defmodule PrismaticPerimeter.TLSChecker do
  @moduledoc """
  Comprehensive TLS configuration assessment for EASM.
  Checks protocol versions, cipher suites, certificates,
  and security headers for discovered assets.
  """

  @spec check_tls(String.t(), pos_integer()) ::
    {:ok, tls_assessment()} | {:error, term()}
  def check_tls(hostname, port \\ 443) do
    ssl_opts = [
      verify: :verify_peer,
      cacerts: :public_key.cacerts_get(),
      depth: 4,
      server_name_indication: String.to_charlist(hostname),
      customize_hostname_check: [
        match_fun: :public_key.pkix_verify_hostname_match_fun(:https)
      ]
    ]

    case :ssl.connect(String.to_charlist(hostname), port, ssl_opts, 10_000) do
      {:ok, socket} ->
        assessment = %{
          protocol: extract_version(socket),
          cipher_suite: extract_cipher(socket),
          certificate: analyze_peer_cert(socket),
          chain_valid: true,
          forward_secrecy: check_pfs(socket),
          hostname_match: true
        }
        :ssl.close(socket)
        {:ok, assessment}

      {:error, reason} ->
        {:error, {:connection_failed, reason}}
    end
  end

  @spec calculate_tls_score(tls_assessment()) :: {:ok, float()}
  def calculate_tls_score(assessment) do
    score =
      protocol_score(assessment.protocol) * 0.3 +
      cipher_score(assessment.cipher_suite) * 0.25 +
      certificate_score(assessment.certificate) * 0.25 +
      pfs_score(assessment.forward_secrecy) * 0.1 +
      header_score(assessment) * 0.1

    {:ok, score}
  end
end
```

Weak or expired TLS is flagged as a critical finding in compliance assessments for both NIS2 Directive and ZKB 264/2025 frameworks, which mandate encryption of data in transit for all network-accessible services.

## TLS in the Elixir/OTP Ecosystem

The [BEAM](@/glossary/beam.md) virtual machine provides TLS support through the Erlang `:ssl` application, which wraps OpenSSL (or LibreSSL on some platforms). Phoenix applications configure TLS at the endpoint level, and the Erlang runtime handles all cryptographic operations:

```elixir
defmodule PrismaticCluster.DistributionTLS do
  @moduledoc """
  TLS configuration for BEAM distribution protocol.
  Encrypts inter-node communication in distributed clusters.
  """

  @spec distribution_ssl_opts() :: keyword()
  def distribution_ssl_opts do
    [
      certfile: System.get_env("DIST_CERT_PATH"),
      keyfile: System.get_env("DIST_KEY_PATH"),
      cacertfile: System.get_env("DIST_CA_PATH"),
      verify: :verify_peer,
      secure_renegotiate: true,
      versions: [:"tlsv1.3"],
      fail_if_no_peer_cert: true
    ]
  end
end
```

## Common TLS Misconfigurations

| Misconfiguration | Risk | Detection | Remediation |
|-----------------|------|-----------|-------------|
| **Legacy protocol support** | Downgrade attacks (POODLE, BEAST) | Protocol version scan | Disable TLS 1.0/1.1 |
| **Weak cipher suites** | Cryptographic attacks (SWEET32, LUCKY13) | Cipher enumeration | Restrict to TLS 1.3 suites |
| **Expired certificates** | Trust failure, user warnings | Certificate expiry check | Automated renewal (ACME) |
| **Self-signed certificates** | No third-party trust validation | CA chain verification | Use public CA (Let's Encrypt) |
| **Incomplete certificate chain** | Intermittent trust failures | Chain validation | Include all intermediate certificates |
| **Missing HSTS** | Protocol downgrade risk | Header inspection | Add HSTS with preload |
| **Wildcard certificate overuse** | Expanded blast radius | Certificate scope analysis | Scoped certificates per service |
| **No OCSP stapling** | Revocation check latency | OCSP configuration check | Enable OCSP stapling |
| **RSA key exchange** | No forward secrecy | Key exchange analysis | Require ECDHE only |

## Security Rating Impact

TLS findings directly impact the security ratings computed by Prismatic Perimeter:

| Finding Severity | Rating Impact | Grade Effect |
|-----------------|---------------|-------------|
| Expired certificate | -200 points | Drops to D or F |
| TLS 1.0/1.1 enabled | -100 points | Drops one grade |
| Missing forward secrecy | -50 points | May drop one grade |
| Missing HSTS | -25 points | Minor impact |
| Missing CT logs | -10 points | Informational |

## Related Terms

- [Encryption at Rest](@/glossary/encryption-at-rest.md) - Complementary protection for stored data
- [EASM](@/glossary/easm.md) - External attack surface management assessing TLS configurations
- [Attack Surface](@/glossary/attack-surface.md) - TLS posture as a key component of exposed surface
- [JWT](@/glossary/jwt.md) - Tokens that must be transported over TLS
- [OAuth2](@/glossary/oauth2.md) - Authorization protocol requiring TLS for secure token exchange
- [API Gateway](@/glossary/api-gateway.md) - TLS termination point for API traffic
- [Shodan](@/glossary/shodan.md) - Discovers exposed services including TLS configurations
- [Censys](@/glossary/censys.md) - Certificate transparency and TLS scanning platform
- [Risk Score](@/glossary/risk-score.md) - TLS findings weighted in overall risk calculations
- [Observability](@/glossary/observability.md) - Monitoring TLS certificate expiry and handshake errors
- [Phoenix](@/glossary/phoenix.md) - Framework configuring TLS at the endpoint level

## See Also

- [Architecture](@/architecture/_index.md) - Network security architecture
- [Apps](@/apps/_index.md) - Prismatic Web and API TLS configuration
- [Technologies](@/technologies/_index.md) - Erlang :ssl and Phoenix HTTPS

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
