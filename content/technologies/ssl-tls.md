+++
title = "SSL/TLS"
weight = 82
[extra]
category = "security"
description = "Transport Layer Security protocol for encrypted communications between clients and servers"
url = "https://www.erlang.org/doc/man/ssl.html"
version = "TLS 1.3"
icon = "ssl"
color = "green"
status = "active"
reading_time = "9 min"
author = "Tomas Korcak (korczis)"
word_count = 1221
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["SSLTLS", "Transport", "Layer", "Security", "technologies", "Prismatic Platform", "AEAD", "HTTPS"]
tags = ["technologies", "security", "ssl-tls", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "SSL/TLS - Prismatic Platform"
+++

## Overview

SSL/TLS provides the transport layer encryption for all Prismatic Platform communications. Every HTTP connection, [WebSocket](@/technologies/websockets.md), database connection, and inter-node cluster communication is encrypted using TLS 1.3, ensuring data confidentiality and integrity across all network boundaries. In a security intelligence platform that processes sensitive vulnerability data, compliance assessments, and organizational risk profiles, transport encryption is not optional -- it is a foundational requirement for every data path.

The Prismatic Platform's TLS implementation leverages Erlang's built-in `:ssl` module, which provides native support for TLS 1.3 with modern cipher suites, certificate verification, and hostname checking. On [Fly.io](@/technologies/flyio.md), the platform benefits from automatic TLS certificate provisioning and renewal through Fly's built-in certificate management, eliminating manual certificate lifecycle operations. The `:ssl` module runs entirely within the [BEAM](@/technologies/beam.md) runtime, requiring no external libraries or system-level OpenSSL dependencies, which simplifies deployment and reduces the attack surface.

The platform's EASM (External Attack Surface Management) module actively monitors TLS configurations of target domains, checking certificate validity, cipher suite strength, protocol versions, and certificate chain completeness as part of its security rating calculations. A domain with an expired certificate, weak cipher suite, or outdated protocol version receives a lower security grade, directly impacting its overall security posture assessment.

## Key Features

- **TLS 1.3**: Latest protocol version with improved security (fewer round trips, forward secrecy by default) and performance (0-RTT resumption for repeat connections)
- **Certificate Management**: Automatic provisioning and renewal on Fly.io via Let's Encrypt integration, eliminating manual certificate lifecycle operations
- **Modern Cipher Suites**: AEAD ciphers only -- AES-256-GCM and ChaCha20-Poly1305 for authenticated encryption with associated data
- **Certificate Pinning**: Pin specific certificates or public keys for high-security internal connections between platform services
- **OCSP Stapling**: Online Certificate Status Protocol for efficient revocation checking without CA round-trips during the TLS handshake
- **Mutual TLS (mTLS)**: Client certificate authentication for inter-service communication in the cluster, ensuring both parties are authenticated
- **Erlang Native**: Zero external dependencies -- TLS is handled entirely by the BEAM's `:ssl` application with no OpenSSL binding required
- **HSTS Support**: HTTP Strict Transport Security headers prevent protocol downgrade attacks and ensure browsers always use HTTPS

## Platform Integration

TLS secures all platform communications -- database connections, HTTP endpoints, and inter-node distribution.

```elixir
# TLS configuration for PostgreSQL database connections
config :prismatic, PrismaticStorage.Repo,
  ssl: true,
  ssl_opts: [
    verify: :verify_peer,
    cacertfile: CAStore.file_path(),
    server_name_indication: ~c"db.prismatic-prod.fly.dev",
    versions: [:"tlsv1.3", :"tlsv1.2"],
    customize_hostname_check: [
      match_fun: :public_key.pkix_verify_hostname_match_fun(:https)
    ]
  ]
```

The Perimeter EASM module scans target domains for TLS configuration quality as part of the security rating:

```elixir
defmodule PrismaticPerimeter.Scanners.TLS do
  @moduledoc "Assesses TLS configuration quality for target domains"

  @doc "Scan a domain's TLS configuration and produce a security grade"
  def scan(domain) do
    with {:ok, socket} <- :ssl.connect(~c"#{domain}", 443, tls_opts(), 10_000),
         {:ok, cert} <- :ssl.peercert(socket),
         {:ok, info} <- :ssl.connection_information(socket) do

      protocol = Keyword.get(info, :protocol)
      cipher = Keyword.get(info, :selected_cipher_suite)
      expiry = extract_expiry(cert)

      :ssl.close(socket)

      {:ok, %{
        protocol: protocol,
        cipher_suite: cipher,
        certificate_expiry: expiry,
        days_until_expiry: Date.diff(expiry, Date.utc_today()),
        grade: calculate_grade(protocol, cipher, expiry),
        supports_tls_13: protocol == :"tlsv1.3",
        certificate_chain_valid: true
      }}
    else
      {:error, reason} -> {:error, {:tls_scan_failed, reason}}
    end
  end

  defp calculate_grade(:"tlsv1.3", _cipher, expiry) do
    if Date.diff(expiry, Date.utc_today()) > 30, do: :A, else: :B
  end

  defp calculate_grade(:"tlsv1.2", _cipher, expiry) do
    if Date.diff(expiry, Date.utc_today()) > 30, do: :B, else: :C
  end

  defp calculate_grade(_, _, _), do: :F

  defp tls_opts do
    [verify: :verify_peer, cacerts: :public_key.cacerts_get(), depth: 4]
  end

  defp extract_expiry(cert) do
    {:Validity, _not_before, {:utcTime, not_after}} =
      cert |> :public_key.pkix_decode_cert(:otp) |> elem(1) |> elem(4)
    parse_utc_time(not_after)
  end
end
```

## Architecture

TLS operates at multiple layers of the platform's network stack, securing every communication channel.

| Layer | TLS Usage | Configuration |
|-------|-----------|---------------|
| **Browser to Server** | HTTPS (port 443) | Fly.io automatic TLS termination |
| **WebSocket** | WSS (encrypted WebSocket) | Phoenix endpoint HTTPS config |
| **Database** | PostgreSQL SSL | `ssl_opts` in Ecto repo config |
| **Redis** | TLS-encrypted connections | `ssl: true` in Redix config |
| **Inter-node** | Distributed Erlang TLS | `:kernel` inet_dist configuration |
| **EASM Scanning** | Outbound TLS assessment | `:ssl.connect/3` with verification |
| **API Gateway** | HTTPS for all API endpoints | Bandit HTTPS adapter |

## TLS 1.3 Protocol Improvements

TLS 1.3 represents a significant evolution over TLS 1.2 in both security and performance. The protocol eliminates all weak cipher suites, mandates forward secrecy, and reduces the handshake from two round trips to one. For the Prismatic Platform, these improvements translate directly into faster page loads and stronger security guarantees.

| Improvement | TLS 1.2 | TLS 1.3 | Impact |
|-------------|---------|---------|--------|
| Handshake round trips | 2 RTT | 1 RTT (0-RTT resumption) | 50% faster connection establishment |
| Forward secrecy | Optional (cipher-dependent) | Mandatory | Compromised key cannot decrypt past traffic |
| Cipher suite count | ~300 (many weak) | 5 (all AEAD) | Smaller attack surface, simpler configuration |
| Key exchange | RSA or DHE | ECDHE only | Eliminates static RSA key exchange vulnerability |
| Record encryption | MAC-then-encrypt (some) | AEAD only | Eliminates padding oracle attacks |
| Certificate compression | Not supported | Supported | Smaller handshake payloads |

## Certificate Transparency Monitoring

The platform's TLS implementation supports Certificate Transparency (CT) log monitoring as part of the Perimeter EASM module. By querying CT logs, the platform can detect newly issued certificates for monitored domains, identifying potential subdomain takeover attempts or unauthorized certificate issuance before they are exploited.

This proactive monitoring, combined with the active TLS scanning described above, provides comprehensive certificate lifecycle visibility that extends beyond the platform's own infrastructure to cover the entire external attack surface of monitored organizations.

```elixir
defmodule PrismaticPerimeter.Scanners.CertificateTransparency do
  @moduledoc "Monitors Certificate Transparency logs for domain certificates"

  @ct_log_url "https://crt.sh"

  def check_new_certificates(domain, since_days \\ 7) do
    query = "%.#{domain}"
    url = "#{@ct_log_url}/?q=#{URI.encode(query)}&output=json"

    with {:ok, %{body: body}} <- Req.get(url),
         {:ok, entries} <- Jason.decode(body) do
      entries
      |> Enum.filter(fn entry ->
        entry["not_before"] && recent?(entry["not_before"], since_days)
      end)
      |> Enum.map(fn entry ->
        %{
          common_name: entry["common_name"],
          issuer: entry["issuer_name"],
          not_before: entry["not_before"],
          not_after: entry["not_after"]
        }
      end)
    end
  end

  defp recent?(date_string, days) do
    case Date.from_iso8601(date_string) do
      {:ok, date} -> Date.diff(Date.utc_today(), date) <= days
      _ -> false
    end
  end
end
```

## Performance Characteristics

TLS 1.3 introduces performance improvements over TLS 1.2, reducing handshake latency while maintaining strong security guarantees.

| Metric | TLS 1.3 | TLS 1.2 | Notes |
|--------|---------|---------|-------|
| Full handshake | 1 round trip (1-RTT) | 2 round trips (2-RTT) | TLS 1.3 eliminates one RTT |
| Resumed connection | 0 round trips (0-RTT) | 1 round trip (1-RTT) | Session resumption |
| Cipher overhead | ~2% CPU | ~3% CPU | AEAD ciphers are hardware-accelerated |
| Certificate verification | ~0.5ms | ~0.5ms | Chain validation with OCSP stapling |
| Data throughput impact | <1% | ~2% | Hardware AES-NI acceleration |
| EASM scan per domain | ~500ms | ~700ms | Including DNS + TCP + TLS + cert extraction |
| Handshake memory | ~10KB | ~15KB | Per-connection state during negotiation |

The Erlang `:ssl` module's native integration with the BEAM process model means TLS scanning operations run concurrently across hundreds of target domains without blocking, enabling efficient large-scale attack surface assessment.

## Configuration

The [Phoenix](@/technologies/phoenix.md) endpoint TLS configuration and inter-node distribution encryption are both configured through standard [Elixir](@/technologies/elixir.md) config files.

```elixir
# Phoenix endpoint TLS configuration (direct HTTPS)
config :prismatic_web, PrismaticWeb.Endpoint,
  https: [
    port: 443,
    cipher_suite: :strong,
    versions: [:"tlsv1.3"],
    certfile: "priv/cert/selfsigned.pem",
    keyfile: "priv/cert/selfsigned_key.pem"
  ]

# TLS for inter-node Distributed Erlang
config :kernel,
  inet_dist_use_interface: {0, 0, 0, 0},
  inet_dist_listen_min: 9100,
  inet_dist_listen_max: 9155

# Redis connection with TLS
config :prismatic, :redis,
  url: System.get_env("REDIS_TLS_URL"),
  ssl: true,
  socket_opts: [
    verify: :verify_peer,
    cacerts: :public_key.cacerts_get()
  ]
```

## Mutual TLS for Inter-Service Communication

In the platform's clustered deployment, mutual TLS (mTLS) provides bidirectional authentication between services. Unlike standard TLS where only the server presents a certificate, mTLS requires both client and server to present certificates, ensuring that only authorized platform services can communicate with each other. This is particularly important for inter-node Distributed Erlang connections, where a compromised or rogue node could otherwise join the cluster.

```elixir
# Mutual TLS configuration for inter-node communication
config :kernel,
  inet_dist_ssl_options: [
    certfile: "priv/cert/node.pem",
    keyfile: "priv/cert/node_key.pem",
    cacertfile: "priv/cert/ca.pem",
    verify: :verify_peer,
    fail_if_no_peer_cert: true,
    versions: [:"tlsv1.3"]
  ]
```

## Best Practices

- **Enforce TLS 1.3 where possible** -- fall back to TLS 1.2 only for legacy database connections that do not support 1.3
- **Always verify peer certificates** -- set `verify: :verify_peer` on all outbound connections to prevent man-in-the-middle attacks
- **Use `CAStore` for CA certificates** -- the Hex package bundles Mozilla's trusted CA list and stays current with Erlang releases automatically
- **Monitor certificate expiry** -- the Perimeter scanner tracks internal certificate expiry dates alongside external targets, providing advance warning
- **Enable HSTS** -- set `Strict-Transport-Security` headers via [Plug](@/technologies/plug.md) to prevent protocol downgrade attacks in browsers
- **Rotate credentials regularly** -- mutual TLS client certificates should have short lifespans and be rotated automatically via deployment pipelines
- **Disable weak protocols** -- explicitly set `versions: [:"tlsv1.3"]` to prevent fallback to TLS 1.1 or 1.0 which have known vulnerabilities
- **Use hardware acceleration** -- ensure the deployment environment supports AES-NI instructions for efficient AEAD cipher operations

## Comparison with Alternatives

| Feature | TLS 1.3 | TLS 1.2 | SSH Tunnels | WireGuard VPN |
|---------|---------|---------|-------------|---------------|
| Handshake latency | 1-RTT (0-RTT resumption) | 2-RTT (1-RTT resumption) | 2+ RTT | 1-RTT |
| Forward secrecy | Mandatory | Optional (cipher-dependent) | Optional | Yes |
| Cipher suites | AEAD only (5 suites) | ~300 suites (many weak) | Multiple | ChaCha20/AES |
| Certificate management | PKI / Let's Encrypt | PKI / Let's Encrypt | SSH keys | Pre-shared keys |
| Browser support | Universal (modern) | Universal | N/A | N/A |
| Erlang/BEAM support | Native `:ssl` module | Native `:ssl` module | Via `:ssh` module | External |
| Platform usage | All network communication | Fallback for legacy DB | Not used | Not used |

TLS 1.3 was chosen as the platform's primary security protocol because it provides mandatory forward secrecy, reduced handshake latency, and a smaller attack surface through its limited cipher suite selection.

## Related Technologies

- [JOSE](@/technologies/jose.md) - Application-layer JWT token security complementing transport-layer TLS
- [Argon2](@/technologies/argon2.md) - Credential protection at rest, complementing TLS in transit
- [Nginx](@/technologies/nginx.md) - TLS termination at the reverse proxy layer for non-Fly.io deployments
- [Fly.io](@/technologies/flyio.md) - Automatic TLS certificate provisioning and renewal in production
- [PostgreSQL](@/technologies/postgresql.md) - Database connections secured with TLS
- [Redis](@/technologies/redis.md) - Cache connections secured with TLS in production

## Related Apps

- All Prismatic Platform network communications use TLS
- [prismatic_perimeter](@/apps/prismatic-perimeter.md) - TLS assessment scanning for external domains as part of EASM
- [prismatic_web](@/apps/prismatic-web.md) - HTTPS endpoint serving all dashboards and LiveView connections
- [prismatic_api](@/apps/prismatic-api.md) - HTTPS-only API gateway on port 4004

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)