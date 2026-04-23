+++
title = "RiskIQ / Microsoft Defender TI"
weight = 50
[extra]
category = "global"
type = "threat"
module = "RiskIQ"
description = "Internet intelligence and attack surface management with passive DNS and web crawling"
has_api = true
url = "https://community.riskiq.com"
rate_limit = "API key required, tiered access"
capabilities = ["Passive DNS", "Web Crawling", "SSL Intelligence", "Host Pairs", "WHOIS History", "Attack Surface Management"]
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1724
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["RiskIQ", "Microsoft", "Defender", "Internet", "osint", "global", "Prismatic Platform", "Certificate", "WHOIS"]
tags = ["osint", "global", "riskiq---microsoft-defender-ti", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "RiskIQ / Microsoft Defender TI - Prismatic Platform"
+++

## Overview

RiskIQ, now integrated into Microsoft Defender Threat Intelligence (MDTI), provides internet-scale data collection and [threat intelligence](@/glossary/threat-intelligence.md) capabilities. The platform continuously maps the internet through passive DNS collection, web crawling, SSL certificate monitoring, and host pair analysis. It maintains one of the largest passive DNS databases globally, with billions of DNS resolution records dating back over a decade, making it an indispensable resource for infrastructure investigation, threat actor tracking, and [attack surface](@/glossary/attack-surface.md) management.

The platform's acquisition by Microsoft in 2021 integrated RiskIQ's internet intelligence into the broader Microsoft security ecosystem, enhancing it with Microsoft's global telemetry from Defender, Azure, and Office 365. However, the core RiskIQ datasets -- passive DNS, host pairs, web components, trackers, and cookies -- remain the foundation of the service. These datasets enable analysts to trace the complete lifecycle of internet infrastructure: from initial domain registration through DNS resolution, hosting, content deployment, and eventual decommissioning.

For [OSINT](@/glossary/osint.md) investigators, RiskIQ's unique value lies in its relational data model. Rather than presenting isolated data points, the platform maps relationships between internet entities: which domains resolve to which IPs, which sites embed resources from which other sites, which analytics codes connect otherwise unrelated domains, and how these relationships change over time. This relational approach enables powerful pivot-based investigations where a single indicator can lead to the discovery of entire threat actor infrastructure networks.

RiskIQ's web crawling infrastructure renders pages with a full browser engine, capturing not just static HTML but also JavaScript-loaded content, embedded resources, redirects, and dynamic elements. This browser-based crawling captures the actual user experience, revealing relationships that static crawlers miss -- such as JavaScript-based redirects to malicious sites, dynamically loaded tracking pixels, and iframe-embedded content from third-party domains.

## Data Sources and Coverage

RiskIQ's data collection infrastructure operates continuously across the entire internet, building a comprehensive map of digital infrastructure.

| Data Type | Description | Volume |
|-----------|-------------|--------|
| **Passive DNS** | Historical DNS resolution records (A, AAAA, CNAME, NS, MX, SOA) | Billions of records, 10+ years |
| **Host Pairs** | Parent-child relationships between hosts (redirects, iframes, scripts) | Billions of pairs |
| **SSL Certificates** | Certificate issuance history, chain analysis, SAN extraction | Hundreds of millions |
| **[WHOIS](@/glossary/whois.md) History** | Current and historical domain registration data | Hundreds of millions |
| **Web Components** | Technology detection (CMS, frameworks, CDNs, analytics) | Millions of sites |
| **Trackers** | Analytics IDs, ad network codes, and pixel identifiers | Millions of trackers |
| **Cookies** | Cookie names and values linking related infrastructure | Millions of cookies |
| **Web Crawl Data** | Full page content, DOM structure, and rendered output | Continuous crawling |

### Pivot Relationship Model

The power of RiskIQ lies in its relationship graph. Each data type connects to others, enabling multi-hop pivots that reveal hidden infrastructure connections.

```
Domain --> Passive DNS --> IP Address --> Reverse DNS --> Related Domains
   |                            |
   +--> Host Pairs              +--> SSL Certificates --> Subject Alt Names
   |       |                                                    |
   |       v                                                    v
   |   Web Components                              WHOIS --> Registrant --> Other Domains
   |       |
   v       v
Trackers --> Linked Sites (same analytics ID)
   |
   v
Cookies --> Infrastructure Clusters (same cookie patterns)
```

### Host Pair Categories

| Pair Type | Description | Investigation Value |
|-----------|-------------|-------------------|
| **Redirect** | HTTP 301/302/303/307 redirects | Malware distribution chains, traffic monetization |
| **Script** | JavaScript inclusion from external sources | Supply chain attacks, analytics tracking |
| **iFrame** | Embedded content from other domains | Exploit kits, hidden content injection |
| **Image** | Images loaded from external sources | Tracking pixels, brand impersonation |
| **CSS** | Stylesheets from external sources | CDN relationships, shared hosting |
| **XMLHttpRequest** | AJAX calls to external APIs | Data exfiltration, C2 communication |
| **TopLevelRedirect** | Full page redirects via JavaScript or meta tags | Phishing infrastructure, traffic distribution |

## API Integration

RiskIQ provides a comprehensive REST API (now part of Microsoft Defender Threat Intelligence) for programmatic access to all intelligence datasets. Authentication uses Basic Auth with email and API key.

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v2/dns/passive` | GET | Historical DNS resolution queries |
| `/v2/host-pairs` | GET | Parent-child host relationships |
| `/v2/ssl-certificate/search` | GET | Certificate history and search |
| `/v2/ssl-certificate/{sha1}` | GET | Certificate details by SHA-1 hash |
| `/v2/whois` | GET | Current WHOIS registration data |
| `/v2/whois/search` | GET | Historical WHOIS with keyword search |
| `/v2/host-attributes/components` | GET | Technology detection results |
| `/v2/host-attributes/trackers` | GET | Analytics and tracking code |
| `/v2/host-attributes/cookies` | GET | Cookie analysis results |
| `/v2/enrichment/malware` | GET | Malware intelligence for indicators |
| `/v2/enrichment/osint` | GET | Open source intelligence articles |

### Rate Limits

| Plan | Access Level | Features |
|------|-------------|----------|
| **Community** | Limited queries/day | Basic lookups, passive DNS, WHOIS |
| **Enterprise** | Higher quotas | Full API access, host pairs, components, trackers |
| **MDTI (Microsoft)** | Integrated | Full access via Microsoft 365 Defender portal |

## Query Examples

### curl Examples

```bash
# Passive DNS lookup for a domain
curl -u "user@example.com:API_KEY" \
  "https://api.riskiq.net/pt/v2/dns/passive?query=example.com"

# Passive DNS with time bounds
curl -u "user@example.com:API_KEY" \
  "https://api.riskiq.net/pt/v2/dns/passive?query=example.com&firstSeenAfter=2025-01-01&lastSeenBefore=2026-01-01"

# Host pairs - find what resources a domain loads
curl -u "user@example.com:API_KEY" \
  "https://api.riskiq.net/pt/v2/host-pairs?query=example.com&direction=children"

# Host pairs - find what sites load resources from this domain
curl -u "user@example.com:API_KEY" \
  "https://api.riskiq.net/pt/v2/host-pairs?query=cdn.example.com&direction=parents"

# SSL certificate search by common name
curl -u "user@example.com:API_KEY" \
  "https://api.riskiq.net/pt/v2/ssl-certificate/search?query=example.com&field=subjectCommonName"

# WHOIS lookup with historical data
curl -u "user@example.com:API_KEY" \
  "https://api.riskiq.net/pt/v2/whois/search?query=example.com"

# Web components detection
curl -u "user@example.com:API_KEY" \
  "https://api.riskiq.net/pt/v2/host-attributes/components?query=example.com"

# Tracker search (find sites sharing same Google Analytics ID)
curl -u "user@example.com:API_KEY" \
  "https://api.riskiq.net/pt/v2/host-attributes/trackers?query=example.com"
```

### Elixir Integration

```elixir
# Passive DNS lookup with time bounds
{:ok, dns} = PrismaticOsint.RiskIQ.passive_dns("example.com",
  first_seen_after: ~D[2025-01-01],
  last_seen_before: ~D[2026-01-01]
)
# => %{
#   query: "example.com",
#   total_records: 234,
#   results: [
#     %{resolve: "1.2.3.4", rrtype: "A",
#       first_seen: ~U[2025-03-15 00:00:00Z],
#       last_seen: ~U[2026-01-10 00:00:00Z],
#       collected_count: 45_230},
#     %{resolve: "5.6.7.8", rrtype: "A",
#       first_seen: ~U[2020-01-01 00:00:00Z],
#       last_seen: ~U[2025-03-14 00:00:00Z],
#       collected_count: 12_500}
#   ]
# }

# Host pairs - discover infrastructure relationships
{:ok, pairs} = PrismaticOsint.RiskIQ.host_pairs("example.com",
  direction: :children
)
# => %{
#   hostname: "example.com",
#   total_records: 89,
#   pairs: [
#     %{parent: "example.com", child: "cdn.cloudflare.com", cause: "script"},
#     %{parent: "example.com", child: "google-analytics.com", cause: "script"},
#     %{parent: "example.com", child: "tracking.example.net", cause: "img"}
#   ]
# }

# SSL certificate history
{:ok, certs} = PrismaticOsint.RiskIQ.ssl_certificates("example.com",
  field: "subjectCommonName"
)
# => %{certificates: [%{sha1: "abc123...", issuer: "Let's Encrypt",
#       subject_alt_names: ["example.com", "www.example.com"],
#       first_seen: ~U[2025-01-15 00:00:00Z]}]}

# Web component technology detection
{:ok, tech} = PrismaticOsint.RiskIQ.components("example.com")
# => %{hostname: "example.com", components: [
#   %{category: "Web Server", label: "nginx", version: "1.25"},
#   %{category: "CMS", label: "WordPress", version: "6.4"},
#   %{category: "CDN", label: "Cloudflare"}
# ]}

# Tracker-based infrastructure pivoting
{:ok, trackers} = PrismaticOsint.RiskIQ.trackers("example.com")
# => %{hostname: "example.com", trackers: [
#   %{type: "GoogleAnalyticsAccountNumber", value: "UA-12345678-1",
#     linked_domains: ["example.com", "example.org", "related-site.com"]}
# ]}

# Full infrastructure investigation pipeline
{:ok, investigation} = PrismaticOsint.Pipeline.investigate_infrastructure("suspicious-domain.com",
  sources: [:riskiq, :securitytrails, :censys, :crtsh],
  max_depth: 2
)
```

## Data Schema

| Field | Type | Description |
|-------|------|-------------|
| `results[].resolve` | string | Resolved value (IP for A/AAAA, hostname for CNAME/MX/NS) |
| `results[].resolveType` | string | DNS record type (A, AAAA, CNAME, MX, NS, SOA) |
| `results[].firstSeen` | datetime | First observation timestamp |
| `results[].lastSeen` | datetime | Most recent observation timestamp |
| `results[].collected` | integer | Number of times this resolution was observed |
| `results[].recordHash` | string | Unique hash for this specific record |
| `results[].source` | array | Data collection sources |
| `hostPairs[].parentHostname` | string | Parent host in the relationship |
| `hostPairs[].childHostname` | string | Child host in the relationship |
| `hostPairs[].cause` | string | Relationship type (script, redirect, iframe, img, css, xhr) |
| `hostPairs[].firstSeen` | datetime | When the relationship was first observed |
| `hostPairs[].lastSeen` | datetime | When the relationship was last observed |
| `certificates[].sha1` | string | SHA-1 fingerprint of the certificate |
| `certificates[].subjectCommonName` | string | Certificate common name |
| `certificates[].subjectAlternativeNames` | array | All SANs in the certificate |
| `certificates[].issuerCommonName` | string | Certificate issuer |
| `certificates[].notBefore` | datetime | Certificate validity start |
| `certificates[].notAfter` | datetime | Certificate validity end |
| `components[].category` | string | Technology category (Web Server, CMS, CDN, etc.) |
| `components[].label` | string | Technology name |
| `components[].version` | string | Detected version (when available) |
| `trackers[].type` | string | Tracker type (GoogleAnalyticsAccountNumber, etc.) |
| `trackers[].value` | string | Tracker identifier value |

## Use Cases

### Infrastructure Investigation and Attribution

RiskIQ excels at tracing infrastructure ownership and relationships. Starting from a single indicator, analysts can map entire networks of related domains, servers, and services. Passive DNS history reveals every IP address a domain has ever resolved to, while host pairs show the web of resource-loading relationships. This combination enables attribution of infrastructure to specific threat actors through shared analytics codes, cookie patterns, or hosting configurations.

### Attack Surface Management

Continuous discovery and monitoring of internet-facing assets is critical for organizational security posture. RiskIQ discovers assets through DNS, certificates, and web crawling, identifying shadow IT, forgotten infrastructure, and unauthorized deployments. The platform monitors for unauthorized changes to DNS and hosting configurations, detects phishing infrastructure targeting organizational brands through host pair analysis, and tracks certificate issuance to identify unauthorized certificates.

### Threat Intelligence and Indicator Enrichment

RiskIQ transforms individual indicators into comprehensive threat intelligence through its relational data model. Analysts pivot from IOCs to discover related infrastructure through multiple data types. Host pairs map content delivery and malware distribution relationships. Unique tracking codes and cookie patterns reveal connections between seemingly unrelated domains controlled by the same threat actor.

### Brand Protection and Phishing Detection

Web crawling and component analysis enable detection of brand impersonation and phishing infrastructure. RiskIQ identifies domains impersonating organizational brands through web component analysis, detects phishing kit deployments through known component signatures, and tracks the lifecycle of phishing infrastructure from creation to takedown. Tracker-based pivoting reveals networks of related phishing sites sharing the same analytics infrastructure.

### Malware Distribution Chain Analysis

Host pair data reveals the complete chain of redirections and resource loading that malware distribution networks use. From initial compromised sites through traffic distribution systems (TDS) to final exploit kit landing pages, RiskIQ maps the entire delivery chain. This enables security teams to block infrastructure at every stage of the distribution process.

## Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Microsoft integration changes** | Original RiskIQ API migrating to MDTI platform | Monitor Microsoft documentation for API migration timeline |
| **Cost** | Enterprise pricing limits access for independent researchers | Use community tier for basic lookups; combine with free alternatives |
| **Passive DNS coverage** | Coverage depends on sensor deployment; not all DNS observed | Supplement with [SecurityTrails](@/osint/securitytrails.md) and [PassiveDNS](@/osint/passivedns.md) |
| **Web crawl latency** | Pages may not be crawled at the exact time of interest | Use historical data for investigation; active scanning for real-time needs |
| **Tracker attribution limits** | Same analytics ID does not always prove same operator | Validate tracker connections with additional evidence (WHOIS, hosting patterns) |
| **GDPR WHOIS limitations** | European domain WHOIS increasingly redacted | Use historical data from before GDPR; combine with reverse WHOIS techniques |

## Legal and Ethical Considerations

**Publicly Observable Data**: RiskIQ collects data through passive DNS sensors (observing DNS traffic), web crawling (accessing publicly available web pages), and certificate monitoring (querying public certificate transparency logs). All collection methods target publicly accessible infrastructure and do not involve unauthorized access.

**Microsoft Terms of Service**: Access to RiskIQ/MDTI data is governed by Microsoft's terms of service. Enterprise users must comply with their license agreements regarding data usage, storage, and redistribution.

**Investigation Scope**: Infrastructure investigation using RiskIQ data should remain within the bounds of authorized activities. Pivot-based investigation may reveal infrastructure belonging to uninvolved third parties; analysts should verify relevance before including third-party infrastructure in reports.

**Responsible Disclosure**: If infrastructure investigation reveals previously unknown malicious infrastructure, consider responsible disclosure to the affected parties, hosting providers, or relevant CERTs before publishing findings.

## Integration with Prismatic Platform

Within the [Prismatic Platform](@/apps/prismatic.md), RiskIQ serves as the deep internet intelligence layer for infrastructure investigation and attack surface management.

- **Perimeter EASM**: RiskIQ provides comprehensive infrastructure discovery for [Prismatic Perimeter](@/apps/prismatic-perimeter.md), mapping the complete attack surface through DNS, certificates, web crawling, and host pair analysis.
- **Threat Intelligence Pipeline**: IOC enrichment through multi-pivot investigation expands single indicators into complete infrastructure maps, feeding the platform's threat actor tracking capabilities.
- **Brand Protection**: Web component and tracker-based monitoring detects brand impersonation, phishing campaigns, and counterfeit infrastructure targeting monitored organizations.
- **Infrastructure Graphing**: RiskIQ's relational data feeds into the platform's [knowledge graph](@/glossary/knowledge-graph.md), enabling visual exploration of infrastructure relationships across domains, IPs, certificates, and web resources.
- **Cross-Source Validation**: RiskIQ findings are correlated with [SecurityTrails](@/osint/securitytrails.md), [Censys](@/osint/censys.md), [crt.sh](@/osint/crtsh.md), and [Shodan](@/osint/shodan.md) for multi-source validation of infrastructure intelligence.

## Best Practices

1. **Start with trackers for attribution**: Analytics codes (Google Analytics, Facebook Pixel) are among the strongest indicators of common ownership across domains. Start investigations with tracker pivots.

2. **Use host pairs for distribution chains**: When investigating malware delivery, map the complete redirect and resource-loading chain using host pairs. This reveals intermediary infrastructure that may be harder to discover through DNS alone.

3. **Combine passive DNS with WHOIS history**: DNS changes paired with WHOIS changes provide strong evidence for infrastructure ownership transitions and can reveal the timing of domain hijacking or acquisition.

4. **Check certificate SANs**: Subject Alternative Names in SSL certificates often reveal related domains that share the same certificate, indicating common management or hosting.

5. **Track component fingerprints**: Unique combinations of web technologies (specific CMS versions, custom JavaScript libraries, unique error pages) can fingerprint threat actor infrastructure across multiple campaigns.

6. **Use temporal filtering**: Scope queries to relevant investigation time periods to reduce noise from historical infrastructure that may no longer be relevant.

7. **Validate with active scanning**: RiskIQ provides historical and passive data. Verify current infrastructure state with active tools like [Shodan](@/osint/shodan.md) or [Censys](@/osint/censys.md) before taking action.

## Related Providers

- [SecurityTrails](@/osint/securitytrails.md) - DNS and domain intelligence
- [WhoisXML API](@/osint/whoisxml.md) - WHOIS and DNS intelligence platform
- [Censys](@/osint/censys.md) - Internet-wide scanning and certificate data
- [Shodan](@/osint/shodan.md) - Internet device and service discovery
- [crt.sh](@/osint/crtsh.md) - Certificate transparency logs
- [PassiveDNS](@/osint/passivedns.md) - Historical DNS resolution databases
- [BuiltWith](@/osint/builtwith.md) - Technology profiling complementing RiskIQ components

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)