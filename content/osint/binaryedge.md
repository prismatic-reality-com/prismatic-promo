+++
title = "BinaryEdge"
weight = 33
[extra]
icon = "server"
color = "cyan"
category = "global"
type = "ip"
module = "BinaryEdge"
source_type = "IP"
description = "Internet scanning and threat intelligence - real-time view of exposed services, vulnerabilities, and data leaks"
has_api = true
url = "https://www.binaryedge.io"
rate_limit = "Free: 250 req/mo, Starter: $10/mo, Business: custom"
capabilities = ["Host Discovery", "Vulnerability Scanning", "Data Leak Detection", "Subdomain Enumeration", "Torrent Monitoring", "Image Search"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1619
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["BinaryEdge", "Internet", "osint", "global", "Prismatic Platform"]
tags = ["osint", "global", "binaryedge", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "BinaryEdge - Prismatic Platform"
+++

## Overview

BinaryEdge is an internet-wide scanning platform that continuously maps the [attack surface](/glossary/attack-surface/) of the entire IPv4 space, providing a comprehensive real-time view of internet-connected assets and their security posture. Unlike traditional port scanners that focus primarily on TCP/UDP port enumeration and service banner collection, BinaryEdge extends its coverage to non-traditional indicators including data leaks from misconfigured databases, remote desktop exposure with screenshot capture, torrent download activity, and DNS resolution patterns. Acquired by Coalfire in 2021, BinaryEdge brings enterprise-grade scanning infrastructure to the attack surface management domain.

The platform operates a globally distributed sensor network that continuously probes the entire IPv4 address space across hundreds of ports, collecting service banners, protocol responses, SSL/TLS certificates, and application-layer data. Each scan cycle produces petabytes of raw data that BinaryEdge processes through its classification engine, identifying services, detecting vulnerabilities through version matching and probe responses, and flagging exposed sensitive data. The resulting dataset is queryable through a powerful search API that supports both simple lookups and complex boolean queries across all collected data types.

For [OSINT](/glossary/osint/) investigators, BinaryEdge offers a broader view of internet exposure than port-scanning alone. While Shodan and Censys provide excellent service enumeration, BinaryEdge's data leak detection reveals exposed Elasticsearch clusters, MongoDB instances, Redis databases, and other data stores that organizations have inadvertently left accessible. The torrent monitoring capability provides unique behavioral intelligence, associating IP addresses with specific file-sharing activity -- intelligence not available from any other major scanning platform. The remote desktop screenshot feature captures visual evidence of exposed RDP and VNC sessions, providing immediate context about the nature and sensitivity of exposed services.

BinaryEdge's query language supports sophisticated searches combining IP ranges, service types, geographic locations, ASN numbers, and vulnerability identifiers. This enables targeted reconnaissance that would otherwise require custom scanning infrastructure and significant time investment.

## Data Sources and Coverage

BinaryEdge collects data through multiple scanning methodologies, each targeting different aspects of internet-connected infrastructure.

### Active Scanning Infrastructure

The platform operates scanning nodes across multiple geographic regions, performing continuous full-IPv4 sweeps across a prioritized port list. High-value ports (80, 443, 22, 3389, 8080, etc.) are scanned more frequently than less common service ports. The scanning infrastructure identifies services through a combination of banner grabbing, protocol-specific probes, and SSL/TLS handshake analysis.

### Data Leak Detection

Specialized scanners probe for misconfigured data stores using protocol-specific queries. The data leak module checks for open Elasticsearch, MongoDB, CouchDB, Cassandra, Redis, and Memcached instances, and when detected, samples metadata (database names, collection names, record counts) without extracting actual data content. This provides evidence of exposure severity without creating additional privacy violations.

### Passive Collection

BinaryEdge supplements active scanning with passive data collection including DNS resolution records, SSL certificate observations, and torrent tracker monitoring. Passive DNS data reveals domain resolution patterns over time, while certificate observations track SSL/TLS deployment across the internet.

### Coverage Statistics

| Metric | Coverage |
|--------|----------|
| **IPv4 Coverage** | Full IPv4 space (~4.3 billion addresses) |
| **Ports Scanned** | 400+ ports per host |
| **Scan Frequency** | Continuous (high-value ports weekly, full sweep monthly) |
| **Data Leak Protocols** | 8+ database and data store protocols |
| **Geographic Reach** | Scanning from 10+ global locations |
| **Historical Data** | 5+ years of scan history |
| **Subdomain Database** | 1 billion+ DNS records |
| **Torrent Monitoring** | Major public torrent trackers |

## API Integration

### Authentication

BinaryEdge uses API key authentication via the `X-Key` HTTP header. API keys are obtained through account registration at binaryedge.io.

**Base URL**: `https://api.binaryedge.io/v2/`

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v2/query/ip/{target}` | GET | Query a single IP address |
| `/v2/query/ip/historical/{target}` | GET | Historical data for IP |
| `/v2/query/search` | GET | Search using BinaryEdge query language |
| `/v2/query/search/stats` | GET | Statistical aggregation of search results |
| `/v2/query/domains/subdomain/{domain}` | GET | Subdomain enumeration |
| `/v2/query/domains/dns/{domain}` | GET | DNS records for domain |
| `/v2/query/domains/ip/{target}` | GET | Domains resolving to IP |
| `/v2/query/dataleaks/email/{email}` | GET | Check email in data leaks |
| `/v2/query/dataleaks/organization/{domain}` | GET | Organization data leak exposure |
| `/v2/query/torrent/ip/{target}` | GET | Torrent activity for IP |
| `/v2/query/torrent/historical/{target}` | GET | Historical torrent activity |
| `/v2/query/image/ip/{target}` | GET | Remote desktop screenshots |
| `/v2/query/image/search` | GET | Search screenshots by content |

### Pricing and Rate Limits

| Plan | Monthly Queries | Price | Features |
|------|----------------|-------|----------|
| **Free** | 250 | $0 | Basic host queries, limited search |
| **Starter** | 5,000 | $10/mo | Full API access, historical data |
| **Business** | 25,000 | $50/mo | Bulk queries, export, monitoring |
| **Enterprise** | Custom | Contact sales | Dedicated scanning, streaming, SLA |

### curl Examples

```bash
# Query a specific IP address
curl -H "X-Key: YOUR_API_KEY" \
  "https://api.binaryedge.io/v2/query/ip/8.8.8.8"

# Search for exposed MongoDB instances in Czech Republic
curl -H "X-Key: YOUR_API_KEY" \
  "https://api.binaryedge.io/v2/query/search?query=type:mongodb%20country:CZ"

# Enumerate subdomains for a domain
curl -H "X-Key: YOUR_API_KEY" \
  "https://api.binaryedge.io/v2/query/domains/subdomain/example.com"

# Check for data leaks associated with a domain
curl -H "X-Key: YOUR_API_KEY" \
  "https://api.binaryedge.io/v2/query/dataleaks/organization/example.com"

# Get torrent activity for an IP
curl -H "X-Key: YOUR_API_KEY" \
  "https://api.binaryedge.io/v2/query/torrent/ip/1.2.3.4"

# Search for exposed RDP services with screenshots
curl -H "X-Key: YOUR_API_KEY" \
  "https://api.binaryedge.io/v2/query/search?query=type:rdp%20has_screenshot:true%20country:CZ"

# Get statistical breakdown of search results
curl -H "X-Key: YOUR_API_KEY" \
  "https://api.binaryedge.io/v2/query/search/stats?query=type:elasticsearch%20country:CZ&type=ports"
```

## Query Examples

```elixir
# Full host information including all detected services
{:ok, host_data} = BinaryEdge.query_ip("203.0.113.42")
# => %{
#   ip: "203.0.113.42",
#   ports: [22, 80, 443, 3306, 27017],
#   services: [
#     %{port: 80, service: "nginx/1.21.6", protocol: "http"},
#     %{port: 443, service: "nginx/1.21.6", protocol: "https",
#       ssl: %{version: "TLSv1.3", cert_subject: "CN=example.com"}},
#     %{port: 27017, service: "MongoDB 4.4.6", protocol: "mongodb",
#       data_leak: true, databases: ["admin", "users", "production"]}
#   ],
#   country: "CZ",
#   asn: %{asn: 12345, name: "Example ISP"},
#   last_seen: ~U[2025-06-15 08:30:00Z]
# }

# Search for vulnerable services using BinaryEdge query language
{:ok, results} = BinaryEdge.search("type:elasticsearch country:CZ has_data_leak:true")

# Subdomain enumeration with resolution data
{:ok, subdomains} = BinaryEdge.subdomains("example.com")
# => %{subdomains: ["www", "mail", "api", "staging", "dev"], total: 5}

# Data leak check for organization
{:ok, leaks} = BinaryEdge.data_leaks("example.com")
# => %{total: 3, events: [%{type: "mongodb", records: 150000, ...}, ...]}

# Historical IP data for infrastructure change tracking
{:ok, history} = BinaryEdge.historical("203.0.113.42")

# Torrent activity monitoring
{:ok, torrents} = BinaryEdge.torrent_activity("203.0.113.42")
# => %{total: 12, torrents: [%{name: "...", category: "...", timestamp: ...}]}

# Screenshot-based search for exposed remote desktops
{:ok, screenshots} = BinaryEdge.image_search("windows login screen")

# Statistical aggregation for attack surface overview
{:ok, stats} = BinaryEdge.search_stats(
  "ip:203.0.113.0/24",
  aggregate_by: :ports
)
```

## Data Schema

### Host Query Response

```elixir
%BinaryEdge.HostResult{
  origin: %{type: "ip", query: "203.0.113.42"},
  total: 5,
  events: [
    %{
      port: 80,
      protocol: "tcp",
      service: %{
        name: "http",
        product: "nginx",
        version: "1.21.6",
        banner: "HTTP/1.1 200 OK\r\nServer: nginx/1.21.6\r\n..."
      },
      target: %{
        ip: "203.0.113.42",
        port: 80,
        protocol: "tcp"
      },
      result: %{
        data: %{
          state: %{state: "open"},
          service: %{name: "http", product: "nginx", version: "1.21.6"},
          response: %{headers: %{...}, body_sha256: "..."}
        }
      },
      timestamp: "2025-06-15T08:30:00Z"
    }
  ]
}
```

## Use Cases

### Comprehensive Attack Surface Assessment

BinaryEdge enables security teams to map their organization's external attack surface beyond traditional port scanning. By combining service enumeration with data leak detection, remote desktop exposure monitoring, and technology identification, teams gain a holistic view of their internet-facing risk. The search API allows continuous monitoring with automated alerting when new exposures are detected.

### Data Leak Detection and Response

Organizations use BinaryEdge to discover misconfigured databases and data stores that may be exposing sensitive information. The data leak module identifies open Elasticsearch, MongoDB, Redis, and other database instances, quantifies exposure severity through metadata sampling, and provides evidence for incident response teams to remediate before data is exfiltrated by threat actors.

### Shadow IT Discovery

BinaryEdge's subdomain enumeration and IP-based search capabilities reveal unauthorized or forgotten infrastructure -- development servers, staging environments, test databases, and legacy systems that exist outside the official IT inventory. These shadow IT assets often lack security controls and represent significant risk vectors.

### Competitive Intelligence and Market Research

Analysts use BinaryEdge to profile the technical infrastructure of competitors, potential acquisition targets, and market participants. Technology stack identification, cloud provider detection, and infrastructure scale assessment provide insights into technical maturity and investment patterns.

### Torrent and Data Exfiltration Monitoring

The unique torrent monitoring capability enables organizations to detect unauthorized file sharing from corporate IP ranges. This intelligence supports data loss prevention programs, acceptable use policy enforcement, and investigations into potential intellectual property theft.

## Limitations

**Scan Frequency Variation**: High-value ports are scanned more frequently than uncommon ports. Services running on non-standard ports may have stale data, and newly deployed services may not appear immediately.

**Free Tier Constraints**: The 250-query monthly limit on the free tier is quickly exhausted for any substantive investigation. Operational use requires a paid subscription.

**Data Leak Sampling**: The data leak module samples metadata only; it does not extract or store actual leaked data content. While this is ethically appropriate, it means analysts cannot assess the sensitivity of exposed data without direct verification.

**IPv6 Coverage**: BinaryEdge's coverage is primarily IPv4. IPv6 scanning is limited due to the vastly larger address space, leaving a significant blind spot for organizations with IPv6-facing infrastructure.

**Screenshot Availability**: Remote desktop screenshots are captured opportunistically and may not be available for all exposed RDP/VNC services. Screenshot search results can be inconsistent.

## Legal and Ethical Considerations

BinaryEdge scanning is conducted from identified scanner IP addresses that organizations can whitelist or block. The platform's scanning activities are analogous to other internet-wide scanning projects (Shodan, Censys, Project Sonar) and operate under the general principle that querying publicly accessible network services does not constitute unauthorized access.

When using BinaryEdge data for security assessments, organizations should ensure they have authorization to investigate the target IP ranges and domains. Using BinaryEdge to discover vulnerabilities in infrastructure you do not own or have authorization to test may violate computer fraud and abuse laws in many jurisdictions.

Data leak discoveries should be handled responsibly. If BinaryEdge reveals that a third party's database is exposed, security researchers should follow responsible disclosure practices: notify the affected organization directly, allow reasonable time for remediation, and avoid accessing or downloading exposed data. Prismatic Platform's integration includes automated responsible disclosure workflow support.

Torrent monitoring data associating IP addresses with file-sharing activity should be treated as potentially sensitive. Correlation of torrent activity with employee identities requires careful privacy impact assessment and may trigger [GDPR](/glossary/gdpr/) or employment law considerations.

## Integration with Prismatic Platform

Prismatic Platform integrates BinaryEdge as a supplementary internet scanning source alongside Shodan and Censys, implementing a three-scanner correlation approach for maximum coverage and confidence.

### Multi-Scanner Correlation Engine

```elixir
defmodule Prismatic.Perimeter.ScanCorrelation do
  @moduledoc """
  Correlates scan results from BinaryEdge, Shodan, and Censys
  to produce high-confidence service inventories with cross-validation.
  """

  def correlate_host(ip) do
    tasks = [
      Task.async(fn -> BinaryEdge.query_ip(ip) end),
      Task.async(fn -> Shodan.host(ip) end),
      Task.async(fn -> Censys.host(ip) end)
    ]

    results = Task.await_many(tasks, timeout: 30_000)

    %CorrelatedHost{
      ip: ip,
      services: merge_services(results),
      confidence: calculate_cross_validation_score(results),
      data_leaks: extract_data_leaks(results),
      vulnerabilities: deduplicate_vulns(results),
      sources: [:binaryedge, :shodan, :censys]
    }
  end
end
```

### Security Rating Integration

BinaryEdge's data leak detection feeds directly into the [Prismatic Perimeter](/glossary/prismatic-perimeter/) [security rating](/glossary/security-rating/) calculation. Exposed databases, open remote desktop services, and known vulnerabilities are weighted according to severity and contribute to the overall A-F security grade. The torrent monitoring data provides unique behavioral intelligence that supplements traditional infrastructure-based risk assessment.

### Continuous Monitoring

The platform schedules periodic BinaryEdge queries for all monitored assets, tracking changes in service exposure, detecting new data leaks, and alerting on newly discovered vulnerabilities. Change detection triggers re-evaluation of security ratings and automated notification workflows.

## Best Practices

**Combine Multiple Scanners**: Never rely on BinaryEdge alone. Cross-validate findings with Shodan and Censys to achieve comprehensive coverage and reduce false positives. Each scanner has different vantage points, scan schedules, and detection capabilities.

**Monitor Data Leak Exposure Proactively**: Configure automated queries for your organization's IP ranges and domains, specifically checking for database exposure. Data leaks represent some of the highest-severity findings and often indicate fundamental infrastructure misconfigurations.

**Use Query Language Effectively**: BinaryEdge's search syntax supports complex boolean queries combining IP ranges, service types, countries, ASNs, and data characteristics. Invest time in learning the query language to maximize the value of each API query within rate limits.

**Implement Responsible Disclosure**: When BinaryEdge reveals third-party exposures during supply chain assessments, follow responsible disclosure procedures. Document findings, notify affected parties, and allow remediation time before escalating.

**Track Historical Changes**: Use the historical API endpoint to establish baselines and detect changes in infrastructure exposure over time. Trending analysis reveals whether an organization's attack surface is expanding or contracting.

**Budget API Queries**: On limited plans, prioritize queries for high-value targets and use statistical aggregation endpoints to maximize insight per query. Cache results appropriately based on scan freshness indicators.

## Related Providers

- [Shodan](/osint/shodan/) - Internet-connected device search engine with the largest installed base
- [Censys](/osint/censys/) - Internet-wide scanning with certificate and host focus
- [GreyNoise](/osint/greynoise/) - Internet scanner and noise identification for filtering benign traffic
- [ZoomEye](/osint/zoomeye/) - Chinese cyberspace search engine with Asia-Pacific coverage
- [SecurityTrails](/osint/securitytrails/) - DNS and domain intelligence for infrastructure mapping
- [FullHunt](/osint/fullhunt/) - Attack surface intelligence platform
- [DNSdumpster](/osint/dnsdumpster/) - Free DNS reconnaissance and subdomain discovery

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)