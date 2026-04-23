+++
title = "Censys"
weight = 11
[extra]
category = "global"
type = "ip"
module = "Censys"
description = "Internet-wide scanning platform for discovering hosts, certificates, and services"
has_api = true
url = "https://search.censys.io"
rate_limit = "250 req/5min (free), 500 req/5min (researcher), custom (enterprise)"
capabilities = ["Host Search", "Certificate Search", "Service Discovery", "Subdomain Enumeration", "Risk Assessment", "Historical Data", "Cloud Asset Discovery"]
keywords = ["Censys internet scanning", "certificate transparency search", "host discovery platform", "attack surface enumeration", "cloud asset discovery", "TLS certificate analysis", "internet-wide scanning", "ZMap research platform"]
tags = ["osint", "censys", "scanning", "certificates"]
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1715
date_created = "2026-02-23"
date_modified = "2026-02-23"
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Censys - Prismatic Platform"
+++

## Overview

Censys is an Internet intelligence platform founded by researchers at the University of Michigan who created ZMap, the fastest Internet-wide scanner. Censys continuously scans the entire IPv4 address space and popular IPv6 ranges, indexing every reachable host, service, and certificate into a searchable database. The platform performs daily scans across more than 3,500 ports, generating one of the most comprehensive and up-to-date views of the global Internet infrastructure available to security professionals and researchers.

Unlike simple port scanners that merely detect open ports, Censys performs deep application-layer handshakes, capturing full [TLS](/glossary/tls/) certificates, HTTP responses, banner data, and [protocol](/glossary/protocol/)-specific metadata. This application-layer enrichment transforms raw scan data into actionable intelligence about software versions, configurations, misconfigurations, and vulnerabilities. The platform's research heritage ensures rigorous methodology, with peer-reviewed scanning techniques that minimize disruption to scanned networks while maximizing data quality.

Censys serves as the foundational data source for [attack surface](/glossary/attack-surface/) management programs, enabling organizations to discover assets they did not know they owned, identify shadow IT deployments, and continuously monitor their Internet-facing infrastructure for configuration changes and emerging vulnerabilities. The platform's combination of breadth (scanning every routable IP) and depth (full application-layer analysis) makes it uniquely suited for comprehensive external attack surface enumeration.

## Data Sources and Coverage

Censys aggregates data from multiple scanning and intelligence sources to build a comprehensive picture of the global Internet infrastructure.

| Data Type | Description | Update Frequency |
|-----------|-------------|-----------------|
| **Hosts** | Every Internet-accessible host with open ports across 3,500+ ports | Daily |
| **Services** | Protocol-specific data (HTTP, SSH, FTP, SMTP, DNS, RDP, etc.) | Daily |
| **TLS Certificates** | Full X.509 certificate chain analysis from CT logs and scans | Continuous |
| **Autonomous Systems** | ASN ownership, routing data, and peering relationships | Daily |
| **Cloud Assets** | AWS, Azure, GCP resource identification and attribution | Daily |
| **Software** | CPE-based software identification and version detection | Daily |
| **Vulnerabilities** | [CVE](/glossary/cve/) mapping based on detected software versions | Daily |
| **Historical Data** | Point-in-time snapshots of host configurations | Archived |
| **DNS Records** | Forward and reverse DNS resolution for all scanned hosts | Daily |
| **JARM Fingerprints** | TLS server fingerprints for application identification | Daily |

### Certificate Transparency Integration

Censys ingests all [Certificate Transparency](/glossary/certificate-transparency/) (CT) logs, providing a comprehensive view of every publicly trusted certificate ever issued. This integration enables subdomain discovery from certificate Subject Alternative Names (SANs), certificate expiry monitoring across organizational portfolios, rogue and unauthorized certificate detection, certificate authority trust chain analysis, and wildcard certificate coverage mapping. The CT log ingestion is continuous, meaning newly issued certificates appear in Censys search results within minutes of issuance.

### Data Freshness and Quality

Censys maintains a rigorous scanning schedule with daily full-Internet scans across its core port set. The platform employs stateless scanning techniques derived from ZMap, achieving scan rates that cover the entire IPv4 address space in under an hour. Data quality is ensured through banner verification, protocol validation, and deduplication pipelines that remove stale or inconsistent records.

## Technical Architecture

Censys operates a distributed scanning infrastructure deployed across multiple geographic regions to ensure global coverage and minimize scan latency. The architecture consists of several key components.

The scanning layer uses ZMap for initial TCP SYN scanning and ZGrab2 for application-layer banner grabbing. ZMap can scan the entire IPv4 address space on a single port in approximately 45 minutes, while ZGrab2 performs protocol-specific handshakes to extract service metadata, TLS certificates, and HTTP responses.

The ingestion pipeline processes raw scan results through a series of enrichment stages including protocol parsing, certificate chain validation, software fingerprinting via CPE matching, geolocation via MaxMind and internal datasets, ASN attribution via BGP routing tables, and cloud provider identification through IP range mapping.

The search index is built on a custom database engine optimized for Internet-scale host data, supporting complex queries across hundreds of fields with sub-second response times. The query language (Censys Search Language) supports boolean operators, field-specific searches, regular expressions, and CIDR range queries.

The API layer provides RESTful endpoints for programmatic access with JSON responses, supporting search, aggregation, host detail retrieval, certificate lookup, and bulk operations.

## API Integration

Censys provides comprehensive API access for programmatic interaction with all platform capabilities.

```elixir
defmodule PrismaticOsint.Adapters.Censys do
  @moduledoc """
  Censys Internet intelligence adapter for the Prismatic OSINT pipeline.
  Provides host search, certificate discovery, and attack surface enumeration.
  """

  @base_url "https://search.censys.io/api/v2"

  # Search for hosts by organization
  def search_hosts(query, opts \\ []) do
    params = %{q: query, per_page: Keyword.get(opts, :per_page, 100)}

    with {:ok, response} <- api_get("/hosts/search", params) do
      {:ok, parse_host_results(response)}
    end
  end

  # Get detailed host information
  def get_host(ip) do
    with {:ok, response} <- api_get("/hosts/#{ip}") do
      {:ok, %{
        ip: response["ip"],
        services: parse_services(response["services"]),
        autonomous_system: response["autonomous_system"],
        location: response["location"],
        last_updated: response["last_updated_at"]
      }}
    end
  end

  # Search certificates by domain
  def search_certs(query, opts \\ []) do
    params = %{q: query, per_page: Keyword.get(opts, :per_page, 100)}

    with {:ok, response} <- api_get("/certificates/search", params) do
      {:ok, parse_cert_results(response)}
    end
  end

  # Enumerate subdomains via certificate SANs
  def enumerate_subdomains(domain) do
    with {:ok, certs} <- search_certs("names: #{domain}") do
      subdomains =
        certs
        |> Enum.flat_map(& &1.names)
        |> Enum.filter(&String.ends_with?(&1, domain))
        |> Enum.uniq()
        |> Enum.sort()

      {:ok, subdomains}
    end
  end

  # Get aggregate statistics
  def aggregate_hosts(query, opts) do
    field = Keyword.fetch!(opts, :field)
    params = %{q: query, field: field, num_buckets: Keyword.get(opts, :buckets, 50)}

    with {:ok, response} <- api_get("/hosts/aggregate", params) do
      {:ok, parse_aggregation(response)}
    end
  end

  # Bulk host lookup
  def bulk_hosts(ips) when is_list(ips) do
    tasks = Enum.map(ips, fn ip ->
      Task.async(fn -> get_host(ip) end)
    end)

    results = Task.await_many(tasks, 30_000)
    {:ok, Enum.zip(ips, results) |> Enum.into(%{})}
  end

  defp api_get(path, params \\ %{}) do
    headers = [{"Authorization", "Basic #{encode_credentials()}"}]
    # Implementation delegates to HTTP client
    PrismaticOsint.Http.get(@base_url <> path, params, headers)
  end

  defp encode_credentials do
    api_id = Application.get_env(:prismatic_osint, :censys_api_id)
    api_secret = Application.get_env(:prismatic_osint, :censys_api_secret)
    Base.encode64("#{api_id}:#{api_secret}")
  end
end
```

### Attack Surface Discovery Pipeline

```elixir
defmodule PrismaticPerimeter.Discovery.CensysScanner do
  @moduledoc """
  Uses Censys to discover all Internet-facing assets for a target domain.
  Combines certificate, DNS, and organization-based discovery methods.
  """

  alias PrismaticOsint.Adapters.Censys

  def discover_attack_surface(domain) do
    tasks = [
      Task.async(fn -> discover_via_certificates(domain) end),
      Task.async(fn -> discover_via_dns(domain) end),
      Task.async(fn -> discover_via_organization(domain) end)
    ]

    [cert_hosts, dns_hosts, org_hosts] = Task.await_many(tasks, 60_000)

    all_hosts =
      [extract_ok(cert_hosts), extract_ok(dns_hosts), extract_ok(org_hosts)]
      |> List.flatten()
      |> merge_and_deduplicate()

    {:ok, %{
      domain: domain,
      hosts: enrich_with_services(all_hosts),
      total_assets: length(all_hosts),
      discovery_sources: %{
        certificates: count_ok(cert_hosts),
        dns: count_ok(dns_hosts),
        organization: count_ok(org_hosts)
      },
      discovered_at: DateTime.utc_now()
    }}
  end

  defp discover_via_certificates(domain) do
    Censys.search_certs("names: #{domain}")
  end

  defp discover_via_dns(domain) do
    Censys.search_hosts("dns.names: #{domain}")
  end

  defp discover_via_organization(domain) do
    Censys.search_hosts(
      "services.tls.certificates.leaf_data.subject.common_name: #{domain}"
    )
  end
end
```

## Use Cases

### External Attack Surface Management

Censys is the primary data source for [EASM](/glossary/easm/) programs that need comprehensive visibility into an organization's Internet-facing infrastructure. Use cases include discovering all Internet-facing assets for an organization including forgotten and shadow IT systems, mapping cloud infrastructure across AWS, Azure, and GCP deployments, identifying unauthorized services exposed to the Internet, monitoring certificate health and expiry across the enterprise portfolio, and detecting configuration drift in TLS settings and security headers.

### Threat Intelligence and Hunting

Security teams leverage Censys for proactive threat hunting and intelligence gathering. Analysts can track threat actor infrastructure changes over time using historical snapshots, identify command-and-control servers by certificate or banner fingerprints, discover malware staging servers through JARM fingerprint matching, map botnets by identifying hosts with matching service configurations, and correlate indicators of compromise with Internet-wide scan data for attribution.

### Compliance and Configuration Monitoring

Organizations use Censys to verify that their Internet-facing infrastructure meets security and compliance standards. This includes verifying TLS configuration against standards such as PCI-DSS and NIST guidelines, identifying deprecated protocol usage such as SSLv3 and TLS 1.0, monitoring for unauthorized service exposure on restricted ports, validating certificate chain integrity and key strength requirements, and detecting weak cipher suite configurations.

### Mergers and Acquisitions Due Diligence

Censys provides critical visibility during M&A technical due diligence processes. Acquirers can enumerate the complete Internet footprint of an acquisition target, assess the security posture of the target's external infrastructure, identify unknown or undisclosed assets that may represent risk, and evaluate technical debt in certificate management and TLS configuration.

## Data Quality and Validation

Censys maintains high data quality through several mechanisms that ensure accuracy and freshness of scan results.

The platform performs protocol-level validation during scanning, verifying that detected services respond correctly to protocol-specific probes rather than simply detecting open ports. This eliminates false positives from port forwarding, firewalls that respond with RST packets, and misconfigured network equipment.

Certificate data undergoes chain validation to verify certificate authenticity and identify expired, self-signed, or incorrectly configured certificates. The platform cross-references certificates against Certificate Transparency logs to detect discrepancies between issued and deployed certificates.

Software identification uses multiple fingerprinting techniques including banner analysis, HTTP response header matching, TLS JARM fingerprinting, and CPE-based version detection. When multiple techniques disagree, the platform reports the confidence level for each identification.

Historical data is maintained with immutable timestamps, enabling point-in-time analysis and change detection. This temporal dimension allows security teams to identify when a misconfiguration was introduced and correlate changes with security events.

## Platform Integration

Within the Prismatic ecosystem, Censys serves as a foundational data source for the [Prismatic Perimeter](/apps/prismatic-perimeter/) EASM module. The integration operates at multiple levels.

The asset discovery pipeline uses Censys as the primary enumeration engine, combining certificate-based, DNS-based, and organization-based discovery methods to build a comprehensive asset inventory. Discovered assets are automatically enriched with service details, vulnerability mapping, and configuration analysis.

The security rating engine incorporates Censys data into its scoring model, penalizing organizations for exposed services on non-standard ports, weak TLS configurations, expired certificates, and known vulnerable software versions. The scoring weights are calibrated against industry benchmarks and regulatory requirements.

The continuous monitoring system polls Censys for changes to monitored assets, generating alerts when new services appear, certificates expire, or configuration changes are detected. This enables near-real-time attack surface monitoring without requiring the organization to deploy its own scanning infrastructure.

Censys data is correlated with intelligence from complementary sources including [Shodan](/osint/shodan/) for cross-validation of detected services, [crt.sh](/osint/crtsh/) for certificate transparency verification, [GreyNoise](/osint/greynoise/) for distinguishing scanning noise from targeted attacks, and [AbuseIPDB](/osint/abuseipdb/) for IP reputation context.

## NABLA Compliance

The Censys integration within the Prismatic platform adheres to the NABLA epistemic framework axioms to ensure intelligence quality and reliability.

**Signal Plurality**: Censys data is never used as the sole source for security assessments. All findings are cross-validated against at least one independent source such as Shodan, crt.sh, or direct network probing. This ensures that scan artifacts and false positives do not propagate into risk scores.

**Contradiction Preservation**: When Censys reports differ from other scanning platforms regarding service identification or software versions, both findings are preserved and presented with their respective confidence levels. The platform does not silently discard contradictory signals.

**Time Decay**: All Censys scan results carry timestamps that reflect the actual scan time, not the query time. The platform applies configurable freshness weights that reduce the confidence of older scan data, ensuring that assessments reflect current infrastructure state rather than stale snapshots.

**Provenance Mandatory**: Every data point sourced from Censys includes full provenance metadata including the scan date, query parameters, API response identifiers, and the specific Censys data pipeline version. This enables complete audit trails for compliance and investigation purposes.

**Source Independence**: Censys is treated as an independent source from other scanning platforms, each with its own scanning methodology, coverage biases, and data quality characteristics. Source independence weights are applied when aggregating signals from multiple scanning providers.

## Performance and Rate Limits

| Tier | Queries/5 min | Results/Query | Features |
|------|--------------|---------------|----------|
| **Free (Community)** | 250 | 100 | Basic search, host/cert view |
| **Researcher** | 500 | 500 | Advanced search, aggregations |
| **Teams** | 5,000 | 10,000 | Risk assessment, dashboards |
| **Enterprise** | Custom | Unlimited | Full API, ASM platform, integrations |

### Authentication

All API requests require an API ID and Secret passed via HTTP Basic Auth. The credentials are provisioned through the Censys account dashboard. Rate limits are enforced per API credential pair, and requests exceeding the limit receive HTTP 429 responses with Retry-After headers.

### Performance Optimization

The Prismatic adapter implements several optimization strategies for Censys API usage. Results are cached with configurable TTL based on data type: host data is cached for 24 hours matching the scan refresh cycle, while certificate data is cached for 7 days given the slower change rate. Bulk operations are batched to minimize API calls, and retry logic with exponential backoff handles transient rate limit violations gracefully.

Typical query response times range from 200ms for individual host lookups to 2-5 seconds for complex search queries with aggregations. The adapter maintains a connection pool to reduce TLS handshake overhead for high-frequency query patterns.

## Related Resources

- [Shodan](/osint/shodan/) - Internet device search engine with banner grabbing
- [crt.sh](/osint/crtsh/) - Certificate Transparency log search
- [GreyNoise](/osint/greynoise/) - Distinguish scanners from targeted attacks
- [AbuseIPDB](/osint/abuseipdb/) - IP reputation and abuse reporting
- [Spyse](/osint/spyse/) - Internet assets search engine
- [OSINT Core](/apps/prismatic-osint-core/) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](/apps/prismatic-perimeter/) - EASM and security ratings

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)