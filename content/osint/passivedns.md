+++
title = "PassiveDNS"
weight = 62
[extra]
category = "global"
type = "dns"
module = "PassiveDns"
description = "Passive DNS databases aggregating historical DNS resolution data"
has_api = true
url = "https://passivedns.mnemonic.no"
rate_limit = "API key required"
capabilities = ["DNS History", "Domain Tracking", "IP Resolution History", "Infrastructure Mapping", "Fast-Flux Detection", "Domain Clustering"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1459
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["PassiveDNS", "Passive", "osint", "global", "Prismatic Platform", "CIRCL", "Passive DNS", "Farsight DNSDB"]
tags = ["osint", "global", "passivedns", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "PassiveDNS - Prismatic Platform"
+++

## Overview

Passive DNS databases collect and store DNS resolution data observed from real DNS traffic without actively querying authoritative servers. This creates a historical record of which domains resolved to which IP addresses over time. Multiple organizations maintain passive DNS databases including Farsight DNSDB, CIRCL, and mnemonic. These are essential for [threat intelligence](/glossary/threat-intelligence/), attribution, and infrastructure investigation.

Passive DNS operates on a fundamentally different principle from active DNS querying. Rather than asking DNS servers for current resolution data, passive DNS sensors are deployed at strategic points in DNS infrastructure (recursive resolvers, ISP networks, corporate networks) where they observe and record DNS query-response pairs as they occur naturally. This means passive DNS captures the actual DNS resolutions that occurred at specific points in time, providing a historical record that survives domain deregistration, hosting changes, and deliberate infrastructure rotation.

The concept was pioneered by Florian Weimer in 2004 and has since become a cornerstone of cybersecurity investigation methodology. Passive DNS data is used by law enforcement, intelligence agencies, CERTs, and corporate security teams worldwide for threat investigation, malware analysis, and infrastructure attribution. The temporal dimension of passive DNS data -- knowing not just that a domain resolved to an IP, but when it did so, for how long, and how frequently -- provides intelligence that no other DNS data source can match.

Multiple organizations maintain passive DNS databases with varying coverage, retention periods, and access models. The major providers include Farsight DNSDB (the largest commercial passive DNS database), CIRCL passive DNS (open-source, operated by Luxembourg CERT), mnemonic passive DNS (Norwegian security firm), and various ISP and CERT-operated databases. Each provider's coverage depends on the geographic distribution and scale of their sensor network.

## Data Sources and Coverage

| Provider | Organization | Coverage | Retention | Access Model |
|----------|-------------|----------|-----------|-------------|
| **Farsight DNSDB** | Farsight Security (now DomainTools) | Global, 100B+ records | 10+ years | Commercial API |
| **CIRCL pDNS** | CIRCL (Luxembourg CERT) | European focus | 5+ years | Free for research, API for members |
| **mnemonic pDNS** | mnemonic AS (Norway) | Nordic/European | 5+ years | Commercial API |
| **PassiveTotal** | RiskIQ/Microsoft | Global | 5+ years | Part of MDTI platform |
| **VirusTotal pDNS** | Google/VirusTotal | Global | Varies | Part of VT platform |
| **SecurityTrails** | Recorded Future | Global | 10+ years | Commercial API |
| **DNSDB Scout** | DomainTools | Global | 10+ years | Web interface + API |

### Record Types Collected

| DNS Record Type | Description | Intelligence Value |
|----------------|-------------|-------------------|
| **A** | IPv4 address resolution | Core infrastructure mapping |
| **AAAA** | IPv6 address resolution | IPv6 infrastructure discovery |
| **CNAME** | Canonical name aliases | Service delegation and CDN usage |
| **MX** | Mail exchange servers | Email infrastructure identification |
| **NS** | Nameserver delegation | DNS infrastructure and hosting |
| **SOA** | Start of authority | Domain administrative metadata |
| **TXT** | Text records (SPF, DKIM, verification) | Email auth, service verification |
| **SRV** | Service location records | Service discovery and protocols |
| **PTR** | Reverse DNS (IP to hostname) | Infrastructure naming conventions |

## API Integration

Passive DNS data is available through multiple provider APIs. The Prismatic Platform integrates with Farsight DNSDB and CIRCL pDNS as primary sources.

### Farsight DNSDB API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/lookup/rrset/name/{name}` | GET | Forward lookup: domain to IP |
| `/lookup/rdata/ip/{ip}` | GET | Reverse lookup: IP to domains |
| `/lookup/rdata/name/{name}` | GET | Reverse lookup by rdata name |
| `/lookup/rrset/raw/{hex}` | GET | Raw wire format lookup |
| `/summarize/rrset/name/{name}` | GET | Aggregated statistics |
| `/flex/rrnames/{regex}` | GET | Regex search across rrnames |
| `/flex/rdata/{regex}` | GET | Regex search across rdata |

### CIRCL Passive DNS API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/pdns/query/{domain}` | GET | Forward passive DNS lookup |
| `/pdns/query/{ip}` | GET | Reverse passive DNS lookup |

### Rate Limits

| Provider | Free Tier | Paid Tier | Enterprise |
|----------|-----------|-----------|-----------|
| Farsight DNSDB | N/A | 1,000 queries/day | Unlimited |
| CIRCL pDNS | 100 queries/day | 10,000/day (members) | Custom |
| SecurityTrails | 50/month | From 50,000/month | Custom |
| PassiveTotal (MDTI) | 15 queries/day | Unlimited (Enterprise) | Full API |

## Query Examples

### curl Examples

```bash
# Farsight DNSDB - Forward lookup (domain to IPs)
curl -H "X-API-Key: YOUR_KEY" \
  "https://api.dnsdb.info/lookup/rrset/name/example.com/A?time_last_after=-30d"

# Farsight DNSDB - Reverse lookup (IP to domains)
curl -H "X-API-Key: YOUR_KEY" \
  "https://api.dnsdb.info/lookup/rdata/ip/1.2.3.4?limit=100"

# Farsight DNSDB - Time-bounded query
curl -H "X-API-Key: YOUR_KEY" \
  "https://api.dnsdb.info/lookup/rrset/name/example.com/A?time_first_after=1704067200&time_last_before=1735689600"

# Farsight DNSDB - Summarize (statistics without individual records)
curl -H "X-API-Key: YOUR_KEY" \
  "https://api.dnsdb.info/summarize/rrset/name/example.com"

# CIRCL Passive DNS - Forward lookup
curl -u "user:pass" "https://www.circl.lu/pdns/query/example.com"

# CIRCL Passive DNS - Reverse lookup
curl -u "user:pass" "https://www.circl.lu/pdns/query/1.2.3.4"

# Farsight DNSDB - Regex search for subdomains
curl -H "X-API-Key: YOUR_KEY" \
  "https://api.dnsdb.info/flex/rrnames/regex/.*\\.example\\.com?rrtype=A"
```

### Elixir Integration

```elixir
# Forward passive DNS query - domain to historical IPs
{:ok, records} = PrismaticOsint.PassiveDns.query("example.com", type: :forward)
# => [
#   %{rrname: "example.com", rrtype: "A", rdata: "1.2.3.4",
#     first_seen: ~U[2020-01-15 00:00:00Z], last_seen: ~U[2026-02-10 00:00:00Z],
#     count: 45_230},
#   %{rrname: "example.com", rrtype: "A", rdata: "5.6.7.8",
#     first_seen: ~U[2018-06-01 00:00:00Z], last_seen: ~U[2020-01-14 00:00:00Z],
#     count: 12_500}
# ]

# Reverse lookup - what domains pointed to this IP
{:ok, domains} = PrismaticOsint.PassiveDns.query("1.2.3.4", type: :reverse)
# => [
#   %{rrname: "example.com", rrtype: "A", count: 45_230},
#   %{rrname: "another-domain.com", rrtype: "A", count: 8_100},
#   %{rrname: "shared-host.example.org", rrtype: "A", count: 2_300}
# ]

# Time-bounded query for specific investigation period
{:ok, records} = PrismaticOsint.PassiveDns.query("example.com",
  from: ~U[2025-01-01 00:00:00Z],
  to: ~U[2026-01-01 00:00:00Z],
  rrtype: :a
)

# Multi-provider query for cross-validation
{:ok, consolidated} = PrismaticOsint.PassiveDns.query_all_providers("example.com")
# => %{farsight: [...], circl: [...], securitytrails: [...],
#       consensus: [%{ip: "1.2.3.4", providers: 3, confidence: :high}]}

# Fast-flux detection: identify domains with rapid IP rotation
{:ok, analysis} = PrismaticOsint.PassiveDns.detect_fast_flux("suspicious-domain.com")
# => %{is_fast_flux: true, unique_ips: 47, rotation_period_hours: 2.3,
#       ip_countries: ["RU", "CN", "BR", "NG"]}

# Infrastructure clustering: find related domains through shared IPs
{:ok, cluster} = PrismaticOsint.PassiveDns.cluster_infrastructure("1.2.3.4",
  depth: 2, min_overlap: 3
)
# => %{domains: ["example.com", "related.com", "same-actor.net"],
#       shared_ips: ["1.2.3.4", "1.2.3.5"], shared_ns: ["ns1.hosting.com"]}
```

## Data Schema

| Field | Type | Description |
|-------|------|-------------|
| `rrname` | string | Resource record name (domain queried) |
| `rrtype` | string | DNS record type (A, AAAA, CNAME, MX, NS, etc.) |
| `rdata` | string | Resource record data (IP address, hostname, etc.) |
| `time_first` | integer | Unix timestamp of first observation |
| `time_last` | integer | Unix timestamp of most recent observation |
| `count` | integer | Number of times this resolution was observed |
| `bailiwick` | string | Zone authority domain (Farsight-specific) |
| `sensor_id` | string | Identifier of observing sensor (where available) |
| `source` | string | Provider source identifier |

## Use Cases

### Threat Investigation

Passive DNS is the primary tool for tracing domain infrastructure changes over time. When investigating a suspected malicious domain, analysts query passive DNS to reveal all IP addresses it has ever resolved to, enabling identification of shared infrastructure with other malicious domains. This lateral movement through infrastructure relationships is the cornerstone of threat actor attribution.

### Attribution and Infrastructure Mapping

By pivoting between domains and IPs through passive DNS records, analysts build infrastructure graphs that reveal the full scope of a threat actor's operations. Domains that share IP addresses, nameservers, or hosting patterns are likely controlled by the same entity. Temporal overlap in co-hosting strengthens attribution confidence.

### Fast-Flux Detection

Fast-flux networks rotate domain-to-IP mappings rapidly (often every few minutes) to evade takedowns and distribute traffic across compromised hosts. Passive DNS data reveals these rotation patterns by showing dozens or hundreds of distinct IP resolutions for a single domain within short time periods.

### Brand Protection

Organizations monitor passive DNS for domains that previously resolved to IP addresses associated with phishing or impersonation infrastructure targeting their brand. Historical resolution data helps identify and track adversary campaigns even after the phishing sites have been taken down.

### Incident Response

During incident response, passive DNS provides immediate context for observed domains and IP addresses. Querying an IP address reveals all domains that have ever resolved to it, potentially identifying additional compromised infrastructure or command-and-control channels.

## Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Sensor coverage varies** | Not all DNS traffic is observed; coverage depends on sensor placement | Use multiple passive DNS providers for broader coverage |
| **No query-only data** | Only captures resolution (answer) data, not all DNS queries | Supplement with DNS query logs where available |
| **Latency** | Observations may take hours to days to appear in databases | Use active DNS for real-time needs; passive DNS for historical |
| **Cost** | Major providers (Farsight) are expensive for high-volume use | Combine free (CIRCL) and paid sources based on investigation needs |
| **Privacy concerns** | DNS resolution data can reveal user browsing patterns | Providers apply anonymization; use for infrastructure analysis, not user tracking |
| **Short-lived domains** | Domains used briefly may be observed by few sensors | Cross-reference with [certificate transparency](/glossary/certificate-transparency/) and WHOIS for additional coverage |

## Legal and Ethical Considerations

**Data Origin**: Passive DNS data is derived from DNS traffic observation. Providers deploy sensors with the consent of network operators (ISPs, enterprises, universities). The data reflects aggregate resolution patterns, not individual user queries.

**Privacy**: While passive DNS records themselves do not contain personal data, the resolution patterns they reveal (which domains resolved to which IPs when) could potentially be used to deanonymize users in some contexts. Responsible providers apply anonymization and do not expose individual query-level data.

**Research Use**: Many passive DNS providers offer free or reduced-cost access for academic research and CERT operations. These access models typically come with terms restricting commercial use and requiring responsible handling.

**Investigative Use**: Law enforcement and authorized investigators use passive DNS data under appropriate legal authority. The historical nature of the data makes it valuable for investigations where suspects have attempted to destroy evidence by modifying DNS records.

## Integration with Prismatic Platform

Within the [Prismatic Platform](/apps/prismatic/), passive DNS serves as a core intelligence layer for infrastructure investigation and attack surface management.

- **Multi-Provider Aggregation**: The platform queries Farsight DNSDB, CIRCL pDNS, and [SecurityTrails](/osint/securitytrails/) in parallel, consolidating results for cross-provider validation.
- **Infrastructure Graphing**: Passive DNS pivot results feed into the platform's [knowledge graph](/glossary/knowledge-graph/), enabling visual exploration of domain-IP relationships over time.
- **Fast-Flux Detection**: Automated analysis of passive DNS resolution patterns identifies fast-flux networks as part of threat intelligence processing.
- **Historical Change Tracking**: DNS changes for monitored domains are tracked and alerted, supporting [Prismatic Perimeter](/apps/prismatic-perimeter/) attack surface monitoring.
- **Threat Actor Attribution**: Infrastructure clustering through passive DNS pivots supports threat actor profiling and campaign tracking.

## Best Practices

1. **Pivot in both directions**: Always perform both forward (domain to IP) and reverse (IP to domain) lookups to discover the full infrastructure neighborhood.

2. **Use time bounds**: Scope queries to relevant time periods to focus on current infrastructure rather than historical noise.

3. **Cross-reference providers**: Different providers have different sensor coverage. Query multiple sources for comprehensive results.

4. **Validate with active DNS**: Passive DNS shows what was observed, not necessarily current state. Verify critical findings with live DNS queries.

5. **Look for co-hosting patterns**: Domains that repeatedly share IP addresses over time are likely related, even if they are not currently co-hosted.

6. **Track nameserver changes**: NS record changes in passive DNS can indicate domain hijacking, ownership transfers, or infrastructure migration.

7. **Consider count and recency**: High observation counts and recent last-seen timestamps indicate active, well-trafficked domains. Low counts may indicate test infrastructure or sensors with limited visibility.

## Related Providers

- [SecurityTrails](/osint/securitytrails/) - DNS and domain intelligence
- [CIRCL](/osint/circl-lu/) - CIRCL passive DNS and SSL
- [RiskIQ](/osint/riskiq/) - Microsoft passive DNS
- [DNSDumpster](/osint/dnsdumpster/) - Free DNS recon
- [crt.sh](/osint/crtsh/) - [Certificate transparency](/glossary/certificate-transparency/) logs
- [ONYPHE](/osint/onyphe/) - Passive DNS with European coverage
- [WhoisXML](/osint/whoisxml/) - WHOIS and DNS intelligence

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)