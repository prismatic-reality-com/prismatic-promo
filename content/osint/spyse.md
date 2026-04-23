+++
title = "Spyse"
weight = 15
[extra]
category = "global"
type = "ip"
module = "Spyse"
description = "Internet assets search engine combining DNS, WHOIS, certificates, and infrastructure data"
has_api = true
url = "https://spyse.com"
rate_limit = "100 req/day (free), 10000 req/day (pro), custom (enterprise)"
capabilities = ["Domain Intelligence", "IP Lookup", "Certificate Search", "DNS Records", "WHOIS Data", "Subdomain Discovery", "Technology Profiling", "AS Lookup"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1067
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Spyse", "Internet", "WHOIS", "osint", "global", "Prismatic Platform", "Technology", "POST"]
tags = ["osint", "global", "spyse", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Spyse - Prismatic Platform"
+++

## Overview

Spyse is an Internet assets search engine designed for cybersecurity professionals that aggregates data from multiple scanning and passive collection sources into a unified platform. It provides deep visibility into domains, IP addresses, SSL certificates, DNS records, autonomous systems, and the relationships between them. The platform differentiates itself through its relational data model -- rather than presenting isolated data points, it maps connections between Internet assets, enabling analysts to pivot from one entity to related infrastructure effortlessly.

The relational approach transforms individual data points into an interconnected intelligence graph. When an analyst queries a domain, Spyse does not merely return DNS records; it reveals the IP addresses those records resolve to, the other domains hosted on those IPs, the SSL certificates covering those domains, the autonomous systems announcing those IP blocks, and the technologies running on those servers. This web of relationships is what separates Spyse from simple lookup tools and positions it as an infrastructure intelligence platform.

For [OSINT](@/glossary/osint.md) and [attack surface](@/glossary/attack-surface.md) analysis, Spyse provides the foundational infrastructure layer that informs vulnerability assessment, competitive intelligence, and threat investigation workflows. When combined with active scanning data from [Shodan](@/osint/shodan.md) and [Censys](@/osint/censys.md), Spyse's passive intelligence creates a comprehensive view of any organization's Internet-facing infrastructure without generating detectable traffic against the target.

## Data Coverage

| Data Type | Description |
|-----------|-------------|
| **Domains** | Registration, DNS, technology stack, linked IPs |
| **Subdomains** | Passive enumeration from multiple sources |
| **IP Addresses** | Geolocation, ports, services, hosting provider |
| **SSL Certificates** | Issuance, expiry, SANs, chain analysis |
| **DNS Records** | A, AAAA, MX, NS, TXT, SOA, CNAME history |
| **[WHOIS](@/glossary/whois.md)** | Registration, registrar, dates, contact data |
| **Autonomous Systems** | ASN lookup, prefix lists, peering |
| **Technologies** | Web frameworks, CMS, CDN, analytics detection |
| **CVEs** | Vulnerability mapping based on detected software |

### Data Relationships

Spyse maps bidirectional relationships between entities, enabling pivoting across the entire Internet asset graph:

| Starting Entity | Pivot To | Via |
|----------------|---------|-----|
| **Domain** | IPs | DNS A/AAAA records |
| **Domain** | Domains | Shared certificate SANs |
| **Domain** | MX Hosts | MX record resolution |
| **IP** | Domains | Reverse DNS / hosted domains |
| **IP** | IPs | Same ASN / same subnet |
| **Certificate** | Domains | Subject and SAN fields |
| **ASN** | IPs | Announced prefixes |
| **Technology** | Domains | Technology detection matches |

### Data Collection Architecture

Spyse employs a multi-layered collection architecture that combines passive observation with periodic active scanning:

```
Passive Collection Layer:
  - Certificate Transparency log monitoring
  - DNS zone walk enumeration
  - WHOIS registration monitoring
  - BGP route announcements

Active Scanning Layer:
  - Port scanning across common service ports
  - HTTP/HTTPS banner grabbing
  - Technology fingerprinting via response analysis
  - TLS certificate harvesting

Enrichment Layer:
  - Geolocation mapping
  - ASN attribution
  - CVE correlation from detected versions
  - Historical change tracking
```

## Integration with Prismatic

Spyse serves as a comprehensive Internet intelligence source within the Prismatic platform, particularly for the [Prismatic Perimeter](@/apps/prismatic-perimeter.md) [attack surface](@/glossary/attack-surface.md) discovery and the [OSINT Core](@/apps/prismatic-osint-core.md) enrichment pipeline.

```elixir
# Get comprehensive domain intelligence
{:ok, domain} = Spyse.domain("example.com")
# => %{
#   name: "example.com",
#   dns: %{a: ["93.184.216.34"], mx: ["mail.example.com"], ns: ["ns1.example.com"]},
#   whois: %{registrar: "Example Registrar", created: ~D[1995-08-14]},
#   technologies: ["nginx", "React", "Google Analytics"],
#   certificate: %{issuer: "DigiCert", expires: ~D[2025-01-15]},
#   alexa_rank: 12345
# }

# Discover subdomains
{:ok, subdomains} = Spyse.subdomains("example.com")
# => ["www.example.com", "mail.example.com", "api.example.com", ...]

# IP intelligence
{:ok, ip_info} = Spyse.ip("93.184.216.34")

# Search by technology
{:ok, results} = Spyse.search(:domain,
  filters: [%{type: "technology", operator: "eq", value: "WordPress 5.x"}]
)

# Certificate search
{:ok, certs} = Spyse.search(:certificate,
  filters: [%{type: "domain", operator: "contains", value: "example.com"}]
)

# DNS history
{:ok, history} = Spyse.dns_history("example.com", type: :a)

# AS lookup
{:ok, as_info} = Spyse.as(13335)

# Bulk domain lookup
{:ok, bulk} = Spyse.bulk_domain(["example.com", "example.org", "example.net"])
```

### Infrastructure Mapping Pipeline

The infrastructure mapping pipeline leverages Spyse's relational data to build a complete picture of an organization's Internet-facing assets from a single domain input.

```elixir
defmodule PrismaticPerimeter.Discovery.InfrastructureMapper do
  @moduledoc """
  Maps complete infrastructure using Spyse relationship data.
  Discovers co-hosted domains, related certificates, and
  technology dependencies for attack surface assessment.
  """

  def map_infrastructure(domain) do
    with {:ok, domain_data} <- Spyse.domain(domain),
         {:ok, subdomains} <- Spyse.subdomains(domain),
         {:ok, certificates} <- Spyse.search(:certificate, domain_filter(domain)),
         {:ok, dns_history} <- Spyse.dns_history(domain, type: :a) do
      {:ok, %{
        primary_domain: domain_data,
        subdomains: subdomains,
        unique_ips: extract_unique_ips(domain_data, subdomains),
        certificates: certificates,
        technology_stack: domain_data.technologies,
        related_domains: find_related_via_certs(certificates),
        dns_timeline: dns_history,
        infrastructure_risk: assess_infrastructure_risk(domain_data, subdomains)
      }}
    end
  end

  defp assess_infrastructure_risk(domain_data, subdomains) do
    risks = []
    risks = if expired_certificate?(domain_data), do: [:expired_cert | risks], else: risks
    risks = if outdated_technology?(domain_data), do: [:outdated_tech | risks], else: risks
    risks = if length(subdomains) > 100, do: [:large_attack_surface | risks], else: risks
    %{factors: risks, level: risk_level(length(risks))}
  end
end
```

### Technology-Based Vulnerability Correlation

Spyse's technology detection capabilities enable automated vulnerability correlation, identifying potential security issues based on the detected software stack:

```elixir
defmodule PrismaticPerimeter.Assessment.TechVulnerabilityCorrelation do
  @moduledoc """
  Correlates detected technologies from Spyse with known
  vulnerabilities from NVD and Exploit-DB.
  """

  def correlate_vulnerabilities(domain) do
    with {:ok, domain_data} <- Spyse.domain(domain),
         {:ok, cves} <- lookup_technology_cves(domain_data.technologies) do
      {:ok, %{
        domain: domain,
        technologies: domain_data.technologies,
        total_cves: length(cves),
        critical_cves: Enum.count(cves, &(&1.severity == :critical)),
        exploitable: Enum.count(cves, &(&1.has_exploit)),
        recommendations: prioritize_patches(cves)
      }}
    end
  end
end
```

## Search Filter System

Spyse provides a powerful filter-based search system that enables precise querying across its entire dataset. The filter system supports multiple operators and can be combined for complex queries.

| Filter Type | Operators | Example Use |
|------------|----------|-------------|
| **Domain** | equals, contains, starts_with | Find domains matching patterns |
| **IP** | equals, cidr, range | Search by IP or network range |
| **Technology** | equals, contains | Find sites using specific software |
| **Port** | equals, range | Discover services on specific ports |
| **Certificate** | issuer, subject, expiry | Certificate-based infrastructure search |
| **ASN** | equals | Filter by autonomous system |
| **Country** | equals | Geographic filtering |
| **Organization** | contains | Filter by registrant organization |
| **HTTP Status** | equals | Filter by server response status |
| **DNS Type** | equals | Filter specific DNS record types |

### Advanced Query Examples

| Query Purpose | Filter Configuration |
|--------------|---------------------|
| Find all WordPress sites in Czech Republic | Technology=WordPress, Country=CZ |
| Expired certificates on production domains | Certificate expiry < today, Port=443 |
| All domains on a specific ASN | ASN=13335 (Cloudflare) |
| Domains with open admin panels | Technology=phpMyAdmin OR Technology=Adminer |
| IP range reconnaissance | IP CIDR=192.168.0.0/16 |

## Rate Limits and Access

| Tier | Queries/Day | Search Results | Features |
|------|------------|---------------|----------|
| **Free** | 100 | 25 per query | Basic lookups, limited search |
| **Pro** | 10,000 | 1,000 per query | Full API, bulk operations |
| **Business** | 50,000 | 10,000 per query | Priority scanning, webhooks |
| **Enterprise** | Custom | Unlimited | Dedicated infrastructure |

### Authentication

API token required for all API access. Free tier available with registration. The token is passed via the `Authorization: Bearer` header.

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v4/data/domain` | POST | Domain intelligence lookup |
| `/api/v4/data/ip` | POST | IP address intelligence |
| `/api/v4/data/cert` | POST | Certificate details |
| `/api/v4/data/dns` | POST | DNS record lookup |
| `/api/v4/data/as` | POST | Autonomous system lookup |
| `/api/v4/search` | POST | Advanced filtered search |
| `/api/v4/subdomains` | POST | Subdomain enumeration |
| `/api/v4/history/dns` | POST | Historical DNS records |

## Use Cases

### Attack Surface Discovery
- Map complete domain infrastructure for [Perimeter](@/apps/prismatic-perimeter.md) assessments
- Discover shadow domains and forgotten subdomains through certificate and DNS correlation
- Identify shared hosting relationships that may create cross-domain risk
- Enumerate all SSL certificates to find previously unknown assets
- Track infrastructure changes over time through DNS history analysis

### Competitive Intelligence
- Analyze competitor technology stacks to identify strategic platforms
- Track infrastructure changes over time that may signal business decisions
- Identify vendor relationships through DNS and certificates
- Discover marketing technology adoption through JavaScript detection
- Monitor CDN and hosting provider choices for performance benchmarking

### Threat Investigation
- Pivot from one IOC (indicator of compromise) to related infrastructure via shared hosting
- Track domain registration patterns across threat actor campaigns
- Identify bulletproof hosting through ASN analysis and hosting concentration
- Map command-and-control infrastructure through certificate and DNS relationships
- Discover domain fronting and fast-flux configurations

### Compliance and Audit
- Inventory all SSL certificates for governance and expiry management
- Verify DNS configuration compliance (SPF, DKIM, DMARC)
- Identify unauthorized subdomains and shadow IT deployments
- Assess technology stack compliance with organizational standards

## Platform Status Note

Spyse was acquired by CrowdStrike in 2021 and integrated into the CrowdStrike Falcon platform. While the standalone Spyse API is no longer available for new registrations, the Prismatic adapter maintains compatibility with cached data and redirects queries to alternative sources ([Censys](@/osint/censys.md), [Shodan](@/osint/shodan.md), [SecurityTrails](@/osint/securitytrails.md)) when live Spyse data is unavailable. The adapter implements a transparent fallback mechanism:

| Data Type | Primary Source | Fallback Source |
|-----------|---------------|----------------|
| **Domain Intelligence** | Spyse cache | [Censys](@/osint/censys.md) + [SecurityTrails](@/osint/securitytrails.md) |
| **Subdomains** | Spyse cache | [crt.sh](@/osint/crtsh.md) + [SecurityTrails](@/osint/securitytrails.md) |
| **IP Intelligence** | Spyse cache | [Shodan](@/osint/shodan.md) + [IPinfo](@/osint/ipinfo.md) |
| **Certificates** | Spyse cache | [crt.sh](@/osint/crtsh.md) + [Censys](@/osint/censys.md) |
| **DNS History** | Spyse cache | [SecurityTrails](@/osint/securitytrails.md) |
| **Technology** | Spyse cache | [BuiltWith](@/osint/builtwith.md) |

This fallback architecture ensures that Prismatic users receive consistent intelligence regardless of Spyse's availability status, demonstrating the platform's resilience through multi-source adapter design.

## Related Sources

- [Censys](@/osint/censys.md) - Internet-wide scanning with certificate intelligence
- [Shodan](@/osint/shodan.md) - Device and service discovery
- [crt.sh](@/osint/crtsh.md) - [Certificate Transparency](@/glossary/certificate-transparency.md) log search
- [VirusTotal](@/osint/virustotal.md) - Domain reputation and [threat intelligence](@/glossary/threat-intelligence.md)
- [ARES](@/osint/ares.md) - Czech business [registry](@/glossary/registry-otp.md) for entity correlation
- [SecurityTrails](@/osint/securitytrails.md) - DNS and WHOIS history
- [ViewDNS](@/osint/viewdns.md) - DNS intelligence and reverse lookups
- [IPinfo](@/osint/ipinfo.md) - IP geolocation and ASN intelligence
- [BuiltWith](@/osint/builtwith.md) - Technology profiling and detection

## Related Platform Components

- [OSINT Core](@/apps/prismatic-osint-core.md) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](@/apps/prismatic-perimeter.md) - Infrastructure data in [EASM](@/glossary/easm.md) ratings

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)