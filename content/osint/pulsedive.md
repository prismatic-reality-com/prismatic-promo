+++
title = "Pulsedive"
weight = 37
[extra]
icon = "shield"
color = "cyan"
category = "global"
type = "threat"
module = "Pulsedive"
source_type = "threat"
description = "Threat intelligence platform - IOC enrichment, risk scoring, and threat feed aggregation"
has_api = true
url = "https://pulsedive.com"
rate_limit = "Free: 30 req/min, Pro: 100 req/min, Enterprise: custom"
capabilities = ["IOC Enrichment", "Risk Scoring", "Threat Feeds", "Passive DNS", "WHOIS History", "Linked Indicators"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1238
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Pulsedive", "Threat", "osint", "global", "Prismatic Platform", "IOCs"]
tags = ["osint", "global", "pulsedive", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Pulsedive - Prismatic Platform"
+++

## Overview

Pulsedive is a community-driven [threat intelligence](@/glossary/threat-intelligence.md) platform that aggregates indicators of compromise from dozens of open-source threat feeds and enriches them with contextual data including passive DNS, [WHOIS](@/glossary/whois.md), port scans, and web content analysis. Unlike raw feed aggregators, Pulsedive assigns [risk score](@/glossary/risk-score.md)s to indicators based on multiple data points and maintains bidirectional links between related indicators, enabling analysts to pivot from one IOC to discover connected infrastructure.

For [OSINT](@/glossary/osint.md) analysts, Pulsedive provides a unified view of threat intelligence that combines data from numerous feeds with automated enrichment. Its linking capability is particularly valuable for mapping the infrastructure of threat actors across IPs, domains, and URLs.

Pulsedive's risk scoring algorithm considers multiple factors when assessing an indicator: the number and credibility of threat feeds listing it, passive DNS patterns, WHOIS registration characteristics, hosting infrastructure reputation, web content analysis, and historical behavior. This multi-factor scoring provides more nuanced risk assessment than simple blocklist presence, reducing both false positives and false negatives compared to single-source intelligence.

The platform's indicator linking engine automatically discovers relationships between IOCs through shared infrastructure. When a domain is enriched, Pulsedive resolves its DNS records, checks its SSL certificates, and crawls its web content. These enrichment results create links to other indicators in the database -- shared IP addresses, shared nameservers, shared certificates, and referenced URLs. This automatic linking transforms individual IOCs into interconnected threat infrastructure maps.

## Data Sources and Coverage

| Source Category | Examples | Indicators |
|----------------|----------|-----------|
| **Malware Feeds** | Abuse.ch (URLhaus, Feodo Tracker), Malware Bazaar | C2 IPs, payload URLs, file hashes |
| **Phishing Feeds** | PhishTank, OpenPhish, PhishStats | Phishing URLs, impersonation domains |
| **Blocklists** | Blocklist.de, CI Army, DShield | Scanning/attacking IPs |
| **Spam/Botnet** | SpamHaus, SURBL, Composite Blocking List | Bot IPs, spam sources, C2 infrastructure |
| **Vulnerability Feeds** | Exploit-DB, VulnDB references | Exploit URLs, vulnerable hosts |
| **Community Submissions** | Pulsedive user submissions | Various indicators with analyst context |
| **Automated Enrichment** | Passive DNS, WHOIS, port scan, web crawl | Linked indicators, infrastructure context |

### Risk Score Methodology

| Score | Level | Description | Typical Indicators |
|-------|-------|-------------|-------------------|
| 0 | None | No risk indicators detected | Known legitimate infrastructure |
| 1-3 | Low | Minor risk factors; possibly benign | Shared hosting, suspicious registration |
| 4-6 | Medium | Multiple risk factors; warrants investigation | Multiple feed listings, suspicious DNS patterns |
| 7-9 | High | Strong indicators of malicious activity | Active in malware campaigns, confirmed C2 |
| 10 | Critical | Confirmed high-confidence malicious | Active ransomware C2, verified phishing |

## API Integration

Pulsedive provides a [REST API](@/glossary/rest-api.md) at `https://pulsedive.com/api/` with JSON responses. Authentication uses API key passed as a parameter.

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/info.php` | GET | Get indicator details and risk score |
| `/explore.php` | GET | Search indicators by properties |
| `/analyze.php` | GET/POST | Submit indicator for on-demand analysis |
| `/threat.php` | GET | Get threat details (campaigns, actors) |
| `/feed.php` | GET | List and manage threat feeds |
| `/search.php` | GET | Full-text search across all data |

### Rate Limits

| Plan | Requests/Min | Results/Query | Features | Price |
|------|-------------|--------------|----------|-------|
| Free | 30 | 100 | Basic lookups, limited enrichment | $0 |
| Pro | 100 | 1,000 | Full enrichment, bulk queries | $30/mo |
| Enterprise | Custom | 10,000 | On-premise, custom feeds, API priority | Custom |

## Query Examples

### curl Examples

```bash
# Get indicator details with risk score
curl "https://pulsedive.com/api/info.php?indicator=example.com&key=YOUR_KEY"

# Get indicator by ID with full properties
curl "https://pulsedive.com/api/info.php?iid=12345&get=properties,links&key=YOUR_KEY"

# Search for indicators by risk level
curl "https://pulsedive.com/api/explore.php?q=risk%3Dhigh%20type%3Ddomain&key=YOUR_KEY"

# Submit indicator for on-demand analysis
curl -X POST "https://pulsedive.com/api/analyze.php" \
  -d "value=suspicious-domain.com&probe=1&key=YOUR_KEY"

# Get threat details
curl "https://pulsedive.com/api/threat.php?tid=100&get=indicators,links&key=YOUR_KEY"

# Search by feed
curl "https://pulsedive.com/api/explore.php?q=feed%3Durlhaus&key=YOUR_KEY"

# Get linked indicators (pivot from one IOC to related)
curl "https://pulsedive.com/api/info.php?iid=12345&get=links&key=YOUR_KEY"
```

### Elixir Integration

```elixir
# Look up indicator with risk assessment
{:ok, info} = PrismaticOsint.Pulsedive.lookup("example.com")
# => %{
#   indicator: "example.com",
#   type: :domain,
#   risk: :none,
#   risk_score: 0,
#   risk_factors: [],
#   properties: %{
#     dns: [%{type: "A", value: "1.2.3.4"}],
#     whois: %{registrar: "Example Registrar", created: "2010-01-15"},
#     http: %{status: 200, server: "nginx", title: "Example Domain"},
#     technology: ["nginx", "React"]
#   },
#   feeds: [],
#   threats: []
# }

# Enrich a suspicious IP with full context
{:ok, enriched} = PrismaticOsint.Pulsedive.lookup("1.2.3.4",
  properties: true,
  links: true
)
# => %{
#   indicator: "1.2.3.4",
#   type: :ip,
#   risk: :high,
#   risk_score: 8,
#   risk_factors: ["Listed in 3 threat feeds", "Hosting known C2 domains"],
#   feeds: ["urlhaus", "feodo_tracker", "blocklist_de"],
#   links: [
#     %{indicator: "malware-c2.example.com", type: :domain, link_type: :dns},
#     %{indicator: "https://malware-c2.example.com/payload", type: :url, link_type: :redirect}
#   ]
# }

# Pivot from IOC to discover connected infrastructure
{:ok, linked} = PrismaticOsint.Pulsedive.get_links(indicator_id,
  link_type: :dns,
  direction: :both
)

# Submit indicator for on-demand analysis
{:ok, analysis} = PrismaticOsint.Pulsedive.analyze("suspicious-domain.com",
  probe: true
)

# Search for high-risk indicators by type
{:ok, results} = PrismaticOsint.Pulsedive.explore(
  "risk=high type=domain feed=urlhaus",
  limit: 100
)

# Bulk lookup for incident response triage
indicators = ["1.2.3.4", "evil.com", "https://phishing.example.com/login"]
{:ok, results} = PrismaticOsint.Pulsedive.bulk_lookup(indicators)
# => [%{indicator: "1.2.3.4", risk: :high}, ...]

# Monitor threat feed for new IOCs
{:ok, feed} = PrismaticOsint.Pulsedive.get_feed("urlhaus",
  since: ~U[2026-02-01 00:00:00Z],
  limit: 500
)
```

## Data Schema

| Field | Type | Description |
|-------|------|-------------|
| `iid` | integer | Internal indicator identifier |
| `indicator` | string | Indicator value (IP, domain, URL, hash) |
| `type` | enum | `ip`, `domain`, `url`, `hash` |
| `risk` | enum | `none`, `low`, `medium`, `high`, `critical` |
| `risk_recommended` | enum | Community-recommended risk level |
| `stamp_added` | datetime | When indicator was first seen |
| `stamp_updated` | datetime | Last enrichment timestamp |
| `stamp_seen` | datetime | Last seen in a threat feed |
| `stamp_retired` | datetime | When indicator was retired from active feeds |
| `properties.dns` | array | DNS resolution records |
| `properties.whois` | object | WHOIS registration data |
| `properties.http` | object | HTTP response metadata |
| `properties.ssl` | object | SSL certificate details |
| `properties.geo` | object | Geolocation data |
| `properties.port` | array | Open ports and services |
| `feeds` | array | Threat feeds listing this indicator |
| `threats` | array | Associated threat campaigns/actors |
| `links` | array | Related indicators with link type |

## Use Cases

### Incident Response Triage

During incident response, analysts use Pulsedive to rapidly assess whether observed indicators (IPs, domains, URLs) are known threats. The risk score provides immediate prioritization guidance, while linked indicators reveal the broader threat infrastructure that may require additional investigation or blocking.

### Threat Feed Aggregation

Pulsedive aggregates 40+ open-source threat feeds into a unified view with deduplication, risk scoring, and enrichment. This eliminates the need to manage individual feed subscriptions and reconcile conflicting information across sources.

### Infrastructure Pivot Analysis

Starting from a single known-malicious indicator, analysts use Pulsedive's linking capability to discover connected infrastructure. A C2 domain links to its hosting IP, which links to other domains sharing the same IP, which may reveal additional malicious infrastructure controlled by the same threat actor.

### Alert Enrichment

Security operations teams integrate Pulsedive into their SIEM/SOAR workflows to automatically enrich security alerts with threat intelligence context. Alerts involving indicators with high Pulsedive risk scores are prioritized for investigation, while low-risk indicators are deprioritized.

### Threat Campaign Tracking

Pulsedive organizes indicators into threat campaigns and associates them with threat actors. Analysts track the evolution of campaigns over time, identifying new infrastructure additions and tactical changes.

## Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Feed-dependent coverage** | Only knows about indicators in its aggregated feeds | Supplement with platform-specific threat intel sources |
| **Enrichment latency** | On-demand analysis takes seconds to minutes | Pre-enrich critical indicators; use cached results for speed |
| **Free tier rate limits** | 30 req/min limits automated integration | Pro plan for production integrations |
| **Risk score confidence** | Automated scoring may not capture nuanced context | Use risk scores for prioritization, not definitive classification |
| **No proprietary intelligence** | All sources are open-source feeds | Combine with commercial threat intelligence for comprehensive coverage |

## Legal and Ethical Considerations

**Open Source Intelligence**: Pulsedive aggregates publicly available threat intelligence feeds. Using this data for defensive security purposes (blocking malicious IPs, investigating threats, enriching alerts) is standard industry practice.

**Indicator Submission**: When submitting indicators to Pulsedive for analysis, be aware that the analysis results may become part of the public database. Do not submit sensitive or classified indicators.

**False Positives**: Pulsedive risk scores are automated assessments. High scores do not definitively prove malicious intent. Verify findings before taking disruptive actions (blocking IPs, reporting abuse).

## Integration with Prismatic Platform

Within the [Prismatic Platform](@/apps/prismatic.md), Pulsedive serves as a complementary threat intelligence source alongside [AlienVault OTX](@/osint/alienvault-otx.md), [VirusTotal](@/osint/virustotal.md), and [AbuseIPDB](@/osint/abuseipdb.md).

- **Risk Score Normalization**: Pulsedive risk scores are normalized into the platform's unified risk scoring framework alongside scores from other providers.
- **Indicator Linking**: Pulsedive's linking capability feeds the platform's infrastructure mapping, automatically expanding investigations from single IOCs to related networks.
- **Feed Aggregation**: The platform uses Pulsedive as a pre-aggregated threat feed source, reducing the complexity of managing individual feed subscriptions.
- **Alert Enrichment**: Security alerts are automatically enriched with Pulsedive context, providing risk scores and feed matches for triaging.
- **Cross-Source Validation**: Pulsedive findings are cross-referenced with [ThreatFox](@/osint/threatfox.md), [MISP](@/osint/misp.md), and [VirusTotal](@/osint/virustotal.md) for multi-source validation.

## Best Practices

1. **Use indicator links for pivoting**: Pulsedive's linking is its strongest differentiator. Always check linked indicators to discover connected infrastructure.

2. **Check feed sources**: The risk score is more meaningful when you understand which feeds listed the indicator. Three independent feeds provide stronger signal than one.

3. **Monitor feed updates**: Set up alerts for new indicators added to specific threat feeds relevant to your organization's threat landscape.

4. **Batch lookups for efficiency**: Use bulk lookup capabilities during incident response to triage multiple indicators simultaneously.

5. **Combine risk scores**: Use Pulsedive risk scores alongside scores from other providers. Consensus across providers increases confidence.

6. **Submit verified IOCs**: Contribute confirmed IOCs from your investigations back to Pulsedive to strengthen community intelligence.

7. **Check retirement dates**: Indicators that have been retired from all feeds may no longer be actively malicious. Consider recency when making blocking decisions.

## Related Providers

- [AlienVault OTX](@/osint/alienvault-otx.md) - Community threat intelligence with pulses
- [VirusTotal](@/osint/virustotal.md) - Multi-engine malware analysis
- [ThreatFox](@/osint/threatfox.md) - IOC sharing by abuse.ch
- [AbuseIPDB](@/osint/abuseipdb.md) - IP abuse reporting and reputation
- [GreyNoise](@/osint/greynoise.md) - Scanner and noise identification
- [MISP](@/osint/misp.md) - Structured threat intelligence sharing
- [Shodan](@/osint/shodan.md) - Infrastructure intelligence for IP context

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)