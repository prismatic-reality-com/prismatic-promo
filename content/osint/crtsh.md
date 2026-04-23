+++
title = "crt.sh"
weight = 16
[extra]
category = "global"
type = "certificate"
module = "Crtsh"
description = "Certificate Transparency log search engine for discovering domains and monitoring certificates"
has_api = true
url = "https://crt.sh"
rate_limit = "No official limit, recommended 1 req/sec"
capabilities = ["Certificate Search", "Domain Discovery", "Subdomain Enumeration", "Certificate Monitoring", "CA Analysis", "Wildcard Detection"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1590
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["crtsh", "Certificate", "Transparency", "osint", "global", "Prismatic Platform", "Certificate Transparency", "PostgreSQL"]
tags = ["osint", "global", "crtsh", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "crt.sh - Prismatic Platform"
+++

## Overview

crt.sh is a web interface and API for searching [Certificate Transparency](@/glossary/certificate-transparency.md) (CT) logs, operated by Sectigo (formerly Comodo CA). Certificate Transparency is a framework defined in RFC 6962 that requires Certificate Authorities to publicly log every SSL/[TLS](@/glossary/tls.md) certificate they issue before browsers will trust them. This creates a comprehensive, append-only, cryptographically verifiable record of all publicly trusted certificates, forming one of the most valuable passive intelligence sources available to security researchers and OSINT practitioners.

For security professionals, crt.sh is an indispensable tool for subdomain discovery, certificate monitoring, and detecting unauthorized certificate issuance. Since organizations must obtain certificates for their web services, CT logs effectively reveal the existence of subdomains and services that might otherwise be hidden from external observation. A single query to crt.sh can reveal internal hostnames, staging environments, development servers, and partner integration endpoints that would require extensive active scanning to discover through other means.

The fundamental insight that makes crt.sh so valuable for OSINT is that certificate issuance is a necessary precursor to deploying HTTPS services. Organizations preparing to launch new services, internal tools, or test environments must obtain certificates first, and those certificates appear in CT logs often days or weeks before the services become publicly accessible. This temporal advantage makes crt.sh a leading indicator of infrastructure changes.

crt.sh indexes certificates from all major CT logs including Google's Argon, Xenon, and Icarus logs, Cloudflare's Nimbus logs, and DigiCert's Yeti and Nessie logs. The total indexed certificate count exceeds 10 billion, with millions of new certificates added daily. The underlying database is PostgreSQL, enabling direct SQL queries through the Atom feed interface for advanced users.

## Data Sources and Coverage

crt.sh aggregates certificate data from all publicly operated Certificate Transparency logs, providing near-comprehensive coverage of the TLS certificate ecosystem.

| Data Type | Description | Coverage |
|-----------|-------------|---------|
| **Certificates** | Every publicly trusted certificate from CT logs | Near-complete |
| **Domains** | All domain names from certificate Common Names and SANs | Extracted from all certs |
| **Subdomains** | Subdomain discovery through certificate SAN fields | Passive, comprehensive |
| **Certificate Authorities** | Issuer information and CA hierarchies | All public CAs |
| **Timestamps** | Certificate issuance (not-before) and expiry (not-after) dates | Exact from certificate |
| **Precertificates** | Pre-issuance certificates submitted to CT logs | From supporting logs |
| **Wildcard Certs** | Wildcard certificate detection (*.example.com) | All wildcard issuances |
| **CT Log Metadata** | Log server identity, signed certificate timestamp (SCT) | Per-log data |
| **Certificate Chain** | Full issuer chain from leaf to root certificate | When available |
| **Key Details** | Public key algorithm, key size, signature algorithm | Extracted from cert |

### How Certificate Transparency Works

The CT ecosystem operates through a chain of issuance, logging, and verification. When a certificate authority issues a certificate, it must submit the certificate (or a precertificate) to one or more CT logs before the certificate will be trusted by browsers. The CT log returns a Signed Certificate Timestamp (SCT) that proves the certificate was logged. Browsers verify SCTs when connecting to HTTPS sites, ensuring that certificates not logged in CT are flagged as untrusted. crt.sh indexes these CT log entries, making the entire corpus searchable.

This mandatory logging requirement means that the CT ecosystem captures virtually every publicly trusted certificate issued globally. Certificates issued by private CAs (internal enterprise CAs) are not included, as they are not submitted to public CT logs.

## Technical Architecture

crt.sh operates on a PostgreSQL database that indexes certificate data from CT log entries. The architecture consists of a CT log monitoring system that continuously polls all known CT logs for new entries, a certificate parser that extracts structured data from X.509 certificates (domains, validity periods, key details, issuer chains), a PostgreSQL database with specialized indexes for domain name searching using reverse-domain ordering, and a web interface and JSON API for querying the indexed data.

The database uses a SURT (Sort-friendly URI Rewriting Transform) ordering for domain names, which reverses the domain hierarchy (example.com becomes com.example) to enable efficient prefix matching. This allows the wildcard query `%.example.com` to leverage database indexes for fast subdomain enumeration.

The search interface supports several query modes including identity search (matching certificate CN and SAN fields), CA/B Forum lint results, certificate serial number lookup, SHA-256 fingerprint lookup, and organization name search. The JSON output format (`?output=json`) returns structured certificate metadata suitable for programmatic processing.

Advanced users can query the underlying PostgreSQL database directly through the Atom feed interface, enabling complex SQL queries that go beyond the standard search interface. This includes joins across certificate tables, temporal analysis, and aggregate statistics.

## API Integration

crt.sh provides both a simple JSON API and direct database access for programmatic certificate intelligence.

```elixir
defmodule PrismaticOsint.Adapters.Crtsh do
  @moduledoc """
  crt.sh Certificate Transparency adapter for the Prismatic OSINT pipeline.
  Provides subdomain discovery, certificate monitoring, and CA analysis.
  """

  @base_url "https://crt.sh"

  # Search certificates by domain
  def search(domain, opts \\ []) do
    params = %{q: domain, output: "json"}
    params = if Keyword.get(opts, :exclude_expired), do: Map.put(params, :exclude, "expired"), else: params

    with {:ok, response} <- http_get(@base_url, params) do
      certs = Enum.map(response, &parse_certificate/1)
      {:ok, certs}
    end
  end

  # Search with wildcard matching for subdomains
  def search_wildcard(domain) do
    search("%.#{domain}")
  end

  # Extract unique subdomains from certificate SANs
  def enumerate_subdomains(domain) do
    with {:ok, certs} <- search("%.#{domain}") do
      subdomains =
        certs
        |> Enum.flat_map(&extract_names/1)
        |> Enum.filter(&String.ends_with?(&1, ".#{domain}"))
        |> Enum.reject(&String.contains?(&1, "*"))
        |> Enum.uniq()
        |> Enum.sort()

      {:ok, subdomains}
    end
  end

  # Get specific certificate details
  def get_certificate(cert_id) do
    with {:ok, response} <- http_get("#{@base_url}/?id=#{cert_id}&opt=json") do
      {:ok, parse_certificate_detail(response)}
    end
  end

  # Monitor for new certificates
  def new_certificates(domain, opts \\ []) do
    with {:ok, certs} <- search(domain, exclude_expired: true) do
      since = Keyword.get(opts, :since, Date.add(Date.utc_today(), -7))

      recent =
        certs
        |> Enum.filter(fn cert ->
          Date.compare(cert.not_before, since) in [:gt, :eq]
        end)

      {:ok, recent}
    end
  end

  # Search by organization name
  def search_organization(org_name) do
    search("o=#{org_name}")
  end

  defp extract_names(%{name_value: names}) when is_binary(names) do
    names |> String.split("\n") |> Enum.map(&String.trim/1) |> Enum.reject(&(&1 == ""))
  end

  defp extract_names(_), do: []
end
```

### Subdomain Discovery Pipeline

```elixir
defmodule PrismaticPerimeter.Discovery.SubdomainEnumerator do
  @moduledoc """
  Discovers subdomains using Certificate Transparency logs as the
  primary passive discovery method for the Perimeter EASM pipeline.
  """

  alias PrismaticOsint.Adapters.{Crtsh, Censys, CommonCrawl}

  def enumerate(domain) do
    tasks = [
      Task.async(fn -> Crtsh.enumerate_subdomains(domain) end),
      Task.async(fn -> Censys.enumerate_subdomains(domain) end),
      Task.async(fn -> CommonCrawl.subdomains(domain) end)
    ]

    [ct_result, censys_result, cc_result] = Task.await_many(tasks, 60_000)

    ct_subs = extract_ok(ct_result, [])
    censys_subs = extract_ok(censys_result, [])
    cc_subs = extract_ok(cc_result, [])

    all_subdomains =
      [ct_subs, censys_subs, cc_subs]
      |> List.flatten()
      |> Enum.uniq()
      |> Enum.sort()

    {:ok, %{
      domain: domain,
      subdomains: all_subdomains,
      total_count: length(all_subdomains),
      sources: %{
        crtsh: length(ct_subs),
        censys: length(censys_subs),
        common_crawl: length(cc_subs)
      },
      discovered_at: DateTime.utc_now()
    }}
  end
end
```

## Use Cases

### Subdomain Discovery and Attack Surface Mapping

crt.sh is the primary reconnaissance technique for [attack surface mapping](@/apps/prismatic-perimeter.md) through Certificate Transparency. Key applications include discovering internal hostnames inadvertently exposed in certificate SANs, finding staging, development, and test environments that may have weaker security controls, identifying partner integration endpoints and API gateways, enumerating all subdomains without active scanning or DNS brute-forcing, and detecting wildcard certificate usage that may indicate broad infrastructure deployments.

### Certificate Monitoring and Security Operations

Security teams use crt.sh for continuous certificate monitoring across their domain portfolio. Capabilities include detecting unauthorized certificate issuance for organizational domains by external parties, monitoring certificate expiry dates across the enterprise to prevent outage-causing expirations, identifying rogue or misissued certificates that may indicate CA compromise or phishing, tracking certificate authority usage patterns to ensure compliance with organizational CA policies, and detecting certificate transparency log gaps that may indicate evasion attempts.

### Threat Intelligence and Phishing Detection

crt.sh supports threat intelligence workflows focused on certificate-based indicators. Applications include tracking certificate issuance patterns across threat actor infrastructure, identifying phishing domains using look-alike certificates (typosquatting, homograph attacks), monitoring newly created domains for brand abuse through certificate issuance tracking, correlating certificate issuance timing with observed attack campaigns, and identifying shared infrastructure through common certificates issued across multiple domains.

### Certificate Authority Analysis

Researchers and compliance teams use crt.sh to analyze certificate authority behavior. This includes monitoring CA issuance volumes and patterns, detecting CA policy violations such as certificates issued with incorrect parameters, analyzing the certificate ecosystem for a specific organization across all issuing CAs, and tracking the adoption of new certificate standards and key algorithms.

## Data Quality and Validation

crt.sh data quality is inherently high due to the cryptographic nature of Certificate Transparency. Certificates are cryptographically signed by their issuing CA and the CT log signature (SCT) provides a verifiable timestamp. This means certificate data cannot be forged or tampered with after logging.

However, several considerations apply to OSINT usage. CT logs are append-only, meaning revoked or expired certificates remain in the database permanently. Analysts must filter by validity period for current infrastructure mapping. Precertificates may appear in CT logs before the final certificate is issued, potentially with slight differences. Wildcard certificates (*.example.com) indicate that subdomains exist but do not enumerate specific subdomain names. Internal-only services that use certificates from public CAs will appear in CT logs even if the services are not publicly accessible.

Name matching should account for certificate SAN fields that may contain multiple domains, wildcard patterns, and internationalized domain names (IDN). The crt.sh search uses SQL LIKE patterns, so the `%` wildcard matches any string and `_` matches any single character.

## Platform Integration

Within the Prismatic ecosystem, crt.sh serves as the primary subdomain discovery source for the [Prismatic Perimeter](@/apps/prismatic-perimeter.md) EASM pipeline. Certificate data from crt.sh is cross-referenced with [Censys](@/osint/censys.md) host data to correlate discovered subdomains with live services, [Shodan](@/osint/shodan.md) for service identification on discovered hosts, [GreyNoise](@/osint/greynoise.md) for traffic classification on discovered IP addresses, and [Common Crawl](@/osint/common-crawl.md) for historical web content on discovered subdomains.

The security rating engine uses certificate intelligence to assess TLS configuration quality, certificate management practices, and shadow IT exposure.

## NABLA Compliance

**Signal Plurality**: crt.sh certificate data is always cross-validated with at least one additional subdomain discovery source. Active DNS resolution confirms that discovered subdomains are currently live and resolvable.

**Contradiction Preservation**: When crt.sh shows certificates for subdomains that DNS resolution cannot confirm, both signals are preserved. The certificate issuance may predate DNS configuration or indicate decommissioned services.

**Time Decay**: Certificate validity periods provide natural temporal boundaries. Expired certificates receive reduced weight in current infrastructure assessments while remaining valuable for historical analysis.

**Provenance Mandatory**: All certificate data includes the crt.sh certificate ID, the CT log source, the issuing CA, and the query timestamp. Certificate chain data is preserved for full provenance tracking.

**Source Independence**: crt.sh is treated as independent from other certificate intelligence sources (Censys certificate search, Google CT search) as each indexes CT logs with different latency and completeness characteristics.

## Performance and Rate Limits

| Aspect | Details |
|--------|---------|
| **Authentication** | None required (fully public) |
| **Rate Limit** | No official limit; recommended 1 request/second |
| **Output Formats** | HTML, JSON (append `?output=json`) |
| **Database** | [PostgreSQL](@/glossary/postgresql.md)-backed, direct SQL queries via Atom feed |
| **Cost** | Completely free |
| **Response Time** | 1-10 seconds depending on domain certificate volume |
| **Cache** | Results are append-only; aggressive caching recommended |

### Best Practices

Results should be cached aggressively since CT logs are append-only and historical entries never change. Use `%.domain.com` syntax for comprehensive wildcard subdomain matching. Filter out expired certificates for current infrastructure mapping. Deduplicate results as the same domain appears in many certificates across renewals and reissuances. Rate-limit requests to 1 per second to be respectful of the free service.

The Prismatic adapter caches subdomain enumeration results with 24-hour TTL and monitors for new certificate issuances on a configurable schedule (default daily) for tracked domains.

## Related Resources

- [Censys](@/osint/censys.md) - Certificate search with host correlation
- [Common Crawl](@/osint/common-crawl.md) - Passive subdomain discovery from web crawls
- [Shodan](@/osint/shodan.md) - SSL certificate analysis on discovered hosts
- [URLScan](@/osint/urlscan.md) - Visual verification of discovered subdomains
- [Have I Been Pwned](@/osint/haveibeenpwned.md) - Breach data for discovered domains
- [OSINT Core](@/apps/prismatic-osint-core.md) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](@/apps/prismatic-perimeter.md) - Certificate intelligence in EASM pipeline

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)