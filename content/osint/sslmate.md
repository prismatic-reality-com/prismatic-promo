+++
title = "SSLMate Cert Spotter"
weight = 40
[extra]
category = "global"
type = "domain"
module = "Sslmate"
description = "Certificate Transparency monitoring service for certificate discovery and unauthorized issuance detection"
has_api = true
url = "https://sslmate.com/certspotter/"
rate_limit = "Free: 100 queries/hr; Paid: 1000 queries/hr"
capabilities = ["CT Log Monitoring", "Certificate Discovery", "Subdomain Enumeration", "Unauthorized Certificate Detection", "Certificate Expiry Alerts", "Wildcard Certificate Tracking", "Issuance Notifications", "Historical Certificate Data"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 877
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["SSLMate", "Cert", "Spotter", "Certificate", "Transparency", "osint", "global", "Prismatic Platform", "Cert Spotter", "High"]
tags = ["osint", "global", "sslmate-cert-spotter", "prismatic"]
quality_score = 75
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "SSLMate Cert Spotter - Prismatic Platform"
+++

## Overview

SSLMate Cert Spotter is a [Certificate Transparency](@/glossary/certificate-transparency.md) (CT) monitoring service that continuously watches all public CT logs for certificates issued for monitored domains. When a new certificate is detected, Cert Spotter sends real-time notifications, enabling security teams to immediately detect unauthorized certificate issuance, rogue CAs, or malicious activity targeting their domains.

Certificate Transparency is a foundational Internet security mechanism established by RFC 6962 (and later RFC 9162 for CT v2). It requires Certificate Authorities to publicly log every certificate they issue to append-only, cryptographically verifiable logs. This creates an auditable record of all certificates in existence, eliminating the ability of CAs to secretly issue certificates -- a capability that has been exploited in high-profile incidents including the DigiNotar compromise and government-directed interception programs.

Unlike search-oriented tools like [crt.sh](@/osint/crtsh.md) which primarily serve as CT log search engines, Cert Spotter focuses on proactive monitoring and alerting. It automatically detects and notifies about new certificates within minutes of issuance, making it essential for organizations that need to maintain strict certificate governance and detect potential man-in-the-middle attack preparations.

Within the Prismatic Platform, SSLMate Cert Spotter provides real-time certificate monitoring for the [Prismatic Perimeter](@/apps/prismatic-perimeter.md) [EASM](@/glossary/easm.md) module, complementing [crt.sh](@/osint/crtsh.md) for certificate-based subdomain discovery with active monitoring capabilities that trigger automated responses.

## Data Coverage

| Data Type | Description |
|-----------|-------------|
| **Certificate Details** | Full X.509 certificate data (subject, SANs, issuer, validity) |
| **Issuance Events** | Real-time notifications of new certificate issuance |
| **Certificate Authority** | Issuing CA identification and trust chain |
| **Domain Names** | All domain names from CN and SAN fields |
| **Wildcard Certificates** | Detection and tracking of wildcard certificates |
| **Precertificates** | Pre-issuance certificates from CT logs |
| **Expiry Information** | Certificate validity period and expiry dates |
| **Historical Data** | All certificates ever issued for monitored domains |
| **Public Key Info** | Key type, size, and fingerprint |
| **Log Source** | Which CT log(s) recorded the certificate |

### Certificate Transparency Architecture

Understanding the CT ecosystem is essential for interpreting Cert Spotter data:

```
Certificate Authority (CA) issues certificate
    |
    v
CA submits certificate to CT logs (mandatory for browser trust)
    |
    v
CT Log returns Signed Certificate Timestamp (SCT)
    |
    v
Cert Spotter monitors CT logs in real-time (< 5 minutes latency)
    |
    v
Notification sent: webhook / email / API
    |
    v
Prismatic evaluates: authorized or suspicious?
```

### CT Log Ecosystem

Cert Spotter monitors all major CT logs operated by trusted log operators:

| Log Operator | Logs | Coverage |
|-------------|------|---------|
| **Google** | Argon, Xenon, Sapling, etc. | Chrome trusted certificates |
| **Cloudflare** | Nimbus | Cloudflare-issued certificates |
| **DigiCert** | Yeti, Nessie | DigiCert ecosystem |
| **Let's Encrypt** | Oak | Let's Encrypt certificates |
| **Sectigo** | Mammoth, Sabre | Sectigo certificates |

## Integration with Prismatic

SSLMate Cert Spotter provides real-time certificate intelligence for the Prismatic Platform's certificate governance and subdomain discovery workflows.

```elixir
# List certificates for a domain (issuances from CT logs)
{:ok, certs} = SslMate.list_issuances("example.com")
# => %{
#   issuances: [
#     %{id: "abc123",
#       dns_names: ["example.com", "www.example.com", "api.example.com"],
#       issuer: "Let's Encrypt Authority X3",
#       not_before: ~U[2024-01-15 00:00:00Z],
#       not_after: ~U[2024-04-15 00:00:00Z],
#       cert_sha256: "abcdef...",
#       pubkey_sha256: "123456...",
#       type: "cert"},
#     ...
#   ]
# }

# Search for certificates including subdomains
{:ok, certs} = SslMate.list_issuances("example.com", include_subdomains: true)

# Get certificate details by SHA-256 hash
{:ok, cert} = SslMate.get_certificate("abcdef1234567890...")

# Set up domain monitoring (webhook notifications)
{:ok, monitor} = SslMate.monitor_domain("example.com",
  webhook_url: "https://prismatic.example.com/webhooks/certspotter",
  include_subdomains: true
)

# List all monitored domains
{:ok, monitored} = SslMate.list_monitored_domains()

# Extract unique subdomains from certificate history
{:ok, subdomains} = SslMate.enumerate_subdomains("example.com")

# Get certificates expiring within a time window
{:ok, expiring} = SslMate.expiring_certificates("example.com",
  within_days: 30,
  include_subdomains: true
)

# Check for wildcard certificates
{:ok, wildcards} = SslMate.wildcard_certificates("example.com")
```

### Certificate Governance Pipeline

The certificate governance pipeline automatically evaluates every new certificate against organizational policies, triggering alerts and responses for policy violations:

```elixir
defmodule PrismaticPerimeter.CertGovernance.Monitor do
  @moduledoc """
  Monitors certificate issuance for managed domains using SSLMate
  Cert Spotter, detecting unauthorized certificates and rogue CAs.
  """

  def process_certificate_event(event) do
    with {:ok, cert} <- parse_certificate(event),
         {:ok, policy} <- load_certificate_policy(cert.dns_names),
         {:ok, assessment} <- assess_certificate(cert, policy) do
      case assessment.verdict do
        :authorized ->
          {:ok, :acknowledged}

        :suspicious ->
          alert_security_team(cert, assessment)
          {:ok, :alert_sent}

        :unauthorized ->
          alert_security_team(cert, assessment)
          initiate_revocation_workflow(cert)
          {:ok, :revocation_initiated}
      end
    end
  end

  defp assess_certificate(cert, policy) do
    checks = [
      {:authorized_ca, cert.issuer in policy.authorized_cas},
      {:known_domain, all_domains_authorized?(cert.dns_names, policy)},
      {:valid_key_size, cert.key_size >= policy.minimum_key_size},
      {:expected_validity, cert.validity_days <= policy.max_validity_days},
      {:wildcard_allowed, not cert.is_wildcard or policy.wildcards_allowed},
      {:ct_required, cert.has_sct}
    ]

    {:ok, %{
      verdict: determine_verdict(checks),
      failed_checks: Enum.reject(checks, fn {_, v} -> v end),
      certificate: cert,
      policy: policy
    }}
  end
end
```

### Subdomain Discovery via CT Logs

Certificate Transparency logs are one of the most reliable sources for passive subdomain enumeration. The Prismatic adapter extracts all unique subdomains from historical certificate data:

```elixir
defmodule PrismaticPerimeter.Discovery.CertSubdomainEnumerator do
  @moduledoc """
  Enumerates subdomains from Certificate Transparency logs
  using SSLMate Cert Spotter's historical certificate data.
  """

  def enumerate(domain) do
    with {:ok, issuances} <- SslMate.list_issuances(domain, include_subdomains: true) do
      subdomains =
        issuances.issuances
        |> Enum.flat_map(& &1.dns_names)
        |> Enum.uniq()
        |> Enum.filter(&String.ends_with?(&1, domain))
        |> Enum.sort()

      {:ok, %{
        domain: domain,
        total_certificates: length(issuances.issuances),
        unique_subdomains: length(subdomains),
        subdomains: subdomains,
        wildcard_detected: Enum.any?(issuances.issuances, &wildcard?/1),
        cas_used: extract_unique_cas(issuances.issuances),
        discovery_method: :certificate_transparency
      }}
    end
  end

  defp wildcard?(issuance) do
    Enum.any?(issuance.dns_names, &String.starts_with?(&1, "*."))
  end
end
```

## Certificate Policy Enforcement

SSLMate Cert Spotter enables organizations to define and enforce certificate policies that align with security requirements and compliance mandates:

| Policy Rule | Description | Alert Level |
|------------|-------------|------------|
| **Authorized CAs** | Whitelist of approved Certificate Authorities | Critical if violated |
| **Key Size Minimum** | Minimum RSA/ECDSA key size requirement | High if below threshold |
| **Max Validity** | Maximum certificate lifetime allowed | Medium |
| **Wildcard Policy** | Whether wildcard certificates are permitted | High if unexpected |
| **Domain Scope** | Allowed domains and subdomains | Critical if unauthorized |
| **Certificate Type** | DV/OV/EV requirements by domain | Medium |
| **Algorithm** | Required signature algorithms (e.g., no SHA-1) | High |
| **CT Enforcement** | Require SCT from multiple logs | Medium |

### Discovery Method Comparison

Certificate Transparency logs offer significant advantages over other subdomain discovery methods:

| Discovery Method | Completeness | Detection Risk | Historical Data |
|-----------------|-------------|---------------|----------------|
| **CT Log Search** | High (all certificates) | Zero (passive) | Full history |
| **DNS Brute Force** | Medium (dictionary-dependent) | High (active) | None |
| **Web Crawling** | Low (linked pages only) | Medium | Limited |
| **Zone Transfer** | Complete (if misconfigured) | High (active) | None |
| **Passive DNS** | Medium | Zero (passive) | Partial |
| **Search Engine** | Low | Zero (passive) | Cached only |

## Rate Limits and Access

| Tier | Queries/Hour | Monitored Domains | Features | Price |
|------|-------------|------------------|----------|-------|
| **Free** | 100 | 5 | Basic monitoring, email alerts | Free |
| **Personal** | 500 | 25 | Webhook notifications, API access | $11.95/mo |
| **Business** | 1,000 | 250 | Priority monitoring, bulk API | Custom |
| **Enterprise** | Custom | Unlimited | SLA, dedicated support | Custom |

### Authentication

API key required via `Authorization: Bearer` header. Free tier available with registration.

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/issuances` | GET | List certificate issuances for a domain |
| `/api/v1/subdomains` | GET | Enumerate subdomains from CT data |
| `/api/v1/watchlist` | GET/POST | Manage monitored domain watchlist |
| `/api/v1/webhook` | POST | Configure webhook notification endpoints |

## Use Cases

### Certificate Governance
- Detect unauthorized certificate issuance for managed domains within minutes
- Monitor for rogue CA activity targeting organizational domains
- Enforce certificate policies (authorized CAs, key sizes, validity periods, algorithms)
- Maintain an auditable log of all certificates issued for compliance reporting

### Subdomain Discovery
- Discover subdomains from certificate Subject Alternative Names passively
- Complement [crt.sh](@/osint/crtsh.md) with [real-time monitoring](@/capabilities/real-time-monitoring.md) capability
- Feed discovered subdomains into [Perimeter](@/apps/prismatic-perimeter.md) asset inventory
- Identify internal hostnames exposed through certificate SANs

### Security Monitoring
- Detect potential MitM attack preparation through unauthorized certificate issuance
- Monitor certificate lifecycle for expiry risk management
- Track certificate issuance patterns for anomaly detection
- Identify shadow IT through certificates issued for unknown subdomains

### Compliance
- [NIS2](@/glossary/nis2.md) certificate management documentation
- PCI DSS certificate inventory requirements
- SOC 2 certificate governance evidence
- ISO 27001 cryptographic control monitoring

## Related Sources

- [crt.sh](@/osint/crtsh.md) - Certificate Transparency log search engine
- [Censys](@/osint/censys.md) - Internet scanning with certificate intelligence
- [SecurityTrails](@/osint/securitytrails.md) - DNS and [WHOIS](@/glossary/whois.md) history for domain context
- [Shodan](@/osint/shodan.md) - SSL/[TLS](@/glossary/tls.md) certificate analysis on discovered hosts
- [DNSDumpster](@/osint/dnsdumpster.md) - DNS reconnaissance and mapping
- [Spyse](@/osint/spyse.md) - Certificate search and domain intelligence

## Related Platform Components

- [OSINT Core](@/apps/prismatic-osint-core.md) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](@/apps/prismatic-perimeter.md) - Certificate governance in [EASM](@/glossary/easm.md)

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)