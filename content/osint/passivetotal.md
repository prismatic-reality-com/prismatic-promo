+++
title = "PassiveTotal"
weight = 35
[extra]
category = "global"
type = "domain"
module = "Passivetotal"
description = "Passive DNS and threat infrastructure intelligence platform by RiskIQ (now Microsoft)"
has_api = true
url = "https://community.riskiq.com"
rate_limit = "15 req/min (community), custom (enterprise)"
capabilities = ["Passive DNS", "WHOIS History", "SSL Certificate Intelligence", "Host Pair Analysis", "Tracker Detection", "Component Analysis", "Malware Intelligence", "OSINT Enrichment"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1085
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["PassiveTotal", "Passive", "RiskIQ", "Microsoft", "osint", "global", "Prismatic Platform", "WHOIS", "Passive DNS"]
tags = ["osint", "global", "passivetotal", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "PassiveTotal - Prismatic Platform"
+++

## Overview

PassiveTotal, originally built by RiskIQ and now part of Microsoft Defender [Threat Intelligence](@/glossary/threat-intelligence.md) (MDTI), is a threat intelligence platform specializing in passive DNS resolution data, [WHOIS](@/glossary/whois.md) history, SSL certificate intelligence, and web component analysis. PassiveTotal excels at mapping Internet infrastructure relationships, making it the go-to tool for tracking threat actor infrastructure, identifying malicious campaigns, and understanding how domains, IPs, and certificates connect across the global Internet.

The platform collects passive DNS data from a global network of sensors, recording every DNS resolution observed without performing active queries. This creates a comprehensive historical record of which domains pointed to which IPs, enabling investigators to trace infrastructure changes, identify shared hosting, and discover related threat actor domains. Unlike active DNS scanning tools that query authoritative nameservers, passive DNS captures actual resolution behavior as seen by recursive resolvers worldwide, providing a ground-truth view of the Internet's name resolution history.

Within the Prismatic Platform, PassiveTotal provides historical DNS and infrastructure relationship intelligence for the [Prismatic Perimeter](@/apps/prismatic-perimeter.md) [EASM](@/glossary/easm.md) module and the [OSINT Core](@/apps/prismatic-osint-core.md) investigation framework. The platform's unique host pair analysis and tracker correlation capabilities enable infrastructure pivoting techniques that are essential for both defensive attack surface management and offensive threat infrastructure tracking.

## Data Sources and Coverage

PassiveTotal aggregates intelligence from multiple collection mechanisms, combining passive DNS sensor data with WHOIS records, SSL certificate observations, web crawling results, and community threat intelligence. This multi-source approach creates a rich graph of Internet infrastructure relationships.

| Data Type | Description | Coverage |
|-----------|-------------|----------|
| **Passive DNS** | Historical DNS resolutions from global sensor network | Billions of records |
| **WHOIS** | Current and historical WHOIS records with parsed fields | Comprehensive |
| **SSL Certificates** | Certificate history with SHA-1 hash, issuer, SAN analysis | All observed certs |
| **Host Pairs** | Parent-child relationships between hosts (redirects, iframes) | Web crawling derived |
| **Trackers** | Google Analytics, Facebook Pixel, advertising network IDs | Web component detection |
| **Components** | Web technologies detected on hosts (CMS, frameworks, etc.) | Broad detection |
| **Malware** | Malware hash associations with domains and IPs | Threat intelligence feeds |
| **OSINT** | Aggregated threat intelligence from public sources | Community contributed |

### Host Pair Analysis

PassiveTotal's unique host pair feature discovers relationships between domains through web crawling analysis:
```
example-phishing.com (child)
  -> Redirects to: legitimate-bank.com (parent)
  -> Iframe loads: evil-capture.com (child)
  -> JS includes: cdn-tracking.com (child)
```

This capability is particularly valuable for identifying phishing infrastructure, tracking malvertising chains, and discovering watering hole attack setups where legitimate sites are compromised to serve malicious content.

## Technical Architecture

The Prismatic Platform integrates PassiveTotal through a REST API adapter that supports both synchronous lookup operations and asynchronous investigation workflows. The adapter implements intelligent query chaining, where initial lookup results automatically trigger follow-up queries to build comprehensive infrastructure maps.

The pivot engine implements the infrastructure analysis methodology used by threat intelligence analysts: starting from a seed indicator (domain, IP, or certificate hash), the engine systematically expands the investigation through passive DNS pivots, WHOIS registrant searches, certificate SAN enumeration, and tracker correlation. Each expansion step is scored for relevance and potential value, with configurable depth limits to prevent investigation explosion.

The caching layer is particularly important for PassiveTotal integration due to the rate-limited community tier. Passive DNS data is cached with a 72-hour TTL (passive DNS records change infrequently), while WHOIS data uses a 7-day TTL. Cache warming for frequently investigated domains reduces API consumption and improves interactive investigation responsiveness.

Integration with Microsoft Defender Threat Intelligence (MDTI) extends PassiveTotal's capabilities with additional threat intelligence context, reputation scoring, and article-based intelligence that provides narrative context for infrastructure findings.

## API Integration

PassiveTotal provides infrastructure relationship intelligence for the Prismatic Platform, enabling deep threat infrastructure analysis.

```elixir
# Get passive DNS resolutions for a domain
{:ok, pdns} = PassiveTotal.passive_dns("example.com")
# => %{
#   results: [
#     %{resolve: "93.184.216.34", resolve_type: "ip",
#       first_seen: "2020-01-15", last_seen: "2024-12-01",
#       source: ["riskiq", "pingly"]},
#     %{resolve: "104.21.45.67", resolve_type: "ip",
#       first_seen: "2019-03-10", last_seen: "2020-01-14",
#       source: ["riskiq"]}
#   ]
# }

# Reverse passive DNS (which domains pointed to an IP)
{:ok, reverse} = PassiveTotal.passive_dns("93.184.216.34", direction: :reverse)

# Get WHOIS information
{:ok, whois} = PassiveTotal.whois("example.com")

# Search WHOIS by field (find domains by registrant email)
{:ok, related} = PassiveTotal.whois_search(email: "admin@example.com")

# Get SSL certificate history
{:ok, certs} = PassiveTotal.ssl_certificates("example.com")

# Search by SSL certificate hash
{:ok, hosts} = PassiveTotal.ssl_search(sha1: "abc123...")

# Get host pairs (parent/child relationships)
{:ok, pairs} = PassiveTotal.host_pairs("example.com", direction: :children)

# Get web components on a host
{:ok, components} = PassiveTotal.components("example.com")

# Get tracking codes associated with a host
{:ok, trackers} = PassiveTotal.trackers("example.com")

# Search by tracker ID (find all sites with same Google Analytics ID)
{:ok, sites} = PassiveTotal.tracker_search(type: "GoogleAnalyticsAccountNumber",
                                            value: "UA-12345678")
```

### Threat Infrastructure Tracking Pipeline

```elixir
defmodule PrismaticOsint.ThreatIntel.InfrastructureTracker do
  @moduledoc """
  Tracks threat actor infrastructure using PassiveTotal's passive DNS,
  WHOIS, and host pair analysis combined with SecurityTrails history.
  """

  def track_infrastructure(seed_domain) do
    with {:ok, pdns} <- PassiveTotal.passive_dns(seed_domain),
         {:ok, whois} <- PassiveTotal.whois(seed_domain),
         {:ok, related} <- find_related_domains(whois),
         {:ok, pairs} <- PassiveTotal.host_pairs(seed_domain, direction: :children),
         {:ok, trackers} <- expand_via_trackers(seed_domain) do
      {:ok, %{
        seed: seed_domain,
        ip_history: pdns.results,
        registration: whois,
        related_domains: related,
        host_relationships: pairs,
        tracker_linked_sites: trackers,
        infrastructure_map: build_infrastructure_graph(pdns, related, pairs),
        timeline: build_infrastructure_timeline(pdns, whois)
      }}
    end
  end

  defp find_related_domains(whois) do
    PassiveTotal.whois_search(email: whois.registrant_email)
  end
end
```

## Use Cases

### Threat Infrastructure Analysis
- Track threat actor domains through passive DNS pivoting to map campaign infrastructure
- Discover related infrastructure via shared WHOIS registrants and name servers
- Map C2 (Command and Control) infrastructure using host pair and tracker analysis
- Timeline infrastructure changes to understand threat actor operational patterns

### Attack Surface Discovery
- Discover shadow IT through passive DNS correlation with organizational IP ranges
- Identify all domains sharing infrastructure with the target organization
- Feed infrastructure relationships into [Perimeter](@/apps/prismatic-perimeter.md) EASM for comprehensive asset discovery
- Detect forgotten or abandoned domains still pointing to organizational infrastructure

### Brand Protection
- Discover phishing sites via host pair analysis (redirects to legitimate sites indicate credential harvesting)
- Track shared tracking codes across legitimate and fraudulent sites to identify threat actors
- Correlate with [SecurityTrails](@/osint/securitytrails.md) for comprehensive historical DNS context
- Monitor for typosquatting domains through certificate transparency and passive DNS correlation

### Incident Response
- Rapidly map the infrastructure of a threat actor observed during an incident
- Identify additional compromised hosts through shared DNS infrastructure
- Build IOC enrichment pipelines that automatically expand indicators through passive DNS pivots

## Data Quality

PassiveTotal data quality varies by data type, with passive DNS data being highly reliable (based on observed resolutions) and derived intelligence (host pairs, components) subject to web crawling coverage limitations.

| Quality Dimension | Assessment | Notes |
|-------------------|------------|-------|
| **Passive DNS** | Excellent -- observed real-world resolutions | Global sensor network |
| **WHOIS** | Good -- parsed fields with historical tracking | Privacy services limit some data |
| **SSL Certificates** | Good -- comprehensive certificate observations | Coverage depends on scanning scope |
| **Host Pairs** | Good -- derived from web crawling | Limited to crawled sites |
| **Trackers** | Good -- JavaScript-based detection | Requires active crawling |
| **Temporal Coverage** | Excellent -- multi-year historical data | Older data highly valuable |

### Access Tiers

| Tier | Requests/Min | Features |
|------|-------------|----------|
| **Community** | 15 | Passive DNS, WHOIS, components |
| **Enterprise** | Custom | Full API, bulk, projects, integrations |

Authentication via username and API key using HTTP Basic Auth.

## Platform Integration

Within the Prismatic Platform, PassiveTotal provides the infrastructure relationship intelligence layer. The adapter integrates with the Perimeter EASM module for attack surface discovery and with the OSINT Core investigation framework for threat infrastructure analysis. Results are normalized into the Prismatic entity schema, enabling correlation with findings from other DNS and infrastructure intelligence sources.

## NABLA Compliance

PassiveTotal integration satisfies NABLA requirements through its observational data methodology. Passive DNS data represents directly observed network behavior rather than inferred or derived intelligence, providing strong provenance for infrastructure claims. Signal Plurality is enforced by cross-referencing PassiveTotal findings with SecurityTrails, ViewDNS, and crt.sh data to validate infrastructure relationships through independent observations.

Time Decay is naturally supported by passive DNS temporal metadata (first_seen/last_seen timestamps), with recent observations weighted more heavily than historical records in infrastructure assessment scoring.

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| **Passive DNS lookup** | < 1s | 300-700ms |
| **WHOIS lookup** | < 1s | 400-800ms |
| **WHOIS search (by field)** | < 2s | 800ms-1.5s |
| **Host pair query** | < 1s | 300-600ms |
| **Infrastructure mapping (full pivot)** | < 30s | 10-20s |
| **Cache hit ratio** | > 60% | 65-75% |

## Related Resources

- [SecurityTrails](@/osint/securitytrails.md) - Historical DNS and WHOIS intelligence
- [DNSDumpster](@/osint/dnsdumpster.md) - DNS reconnaissance and mapping
- [crt.sh](@/osint/crtsh.md) - [Certificate Transparency](@/glossary/certificate-transparency.md) for domain discovery
- [Censys](@/osint/censys.md) - Internet scanning with certificate intelligence
- [ONYPHE](@/osint/onyphe.md) - European cyber defense with passive DNS
- [BuiltWith](@/osint/builtwith.md) - Technology profiling for component correlation
- [OSINT Core](@/apps/prismatic-osint-core.md) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](@/apps/prismatic-perimeter.md) - EASM with infrastructure intelligence

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)