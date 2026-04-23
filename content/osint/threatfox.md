+++
title = "ThreatFox"
weight = 38
[extra]
icon = "shield"
color = "cyan"
category = "global"
type = "threat"
module = "ThreatFox"
source_type = "threat"
description = "IOC sharing platform by abuse.ch - crowd-sourced indicators of compromise for malware tracking"
has_api = true
url = "https://threatfox.abuse.ch"
rate_limit = "Free, rate limits apply per endpoint"
capabilities = ["IOC Submission", "IOC Search", "Malware Family Lookup", "Tag-Based Search", "Bulk Export", "STIX/TAXII Feed"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1605
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ThreatFox", "sharing", "platform", "abusech", "crowd-sourced", "indicators", "compromise", "osint", "global", "Prismatic Platform"]
tags = ["osint", "global", "threatfox", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "ThreatFox - Prismatic Platform"
+++

## Overview

ThreatFox is an open [threat intelligence](@/glossary/threat-intelligence.md) platform operated by abuse.ch, a well-respected Swiss non-profit research project affiliated with the Institute for Cybersecurity and Engineering at Bern University of Applied Sciences. ThreatFox enables security researchers worldwide to share indicators of compromise (IOCs) associated with malware, including command-and-control (C2) server addresses, botnet infrastructure, payload delivery URLs, and file hashes. Each IOC is tagged with the associated malware family, threat type, confidence level, and MITRE ATT&CK technique identifiers.

For [OSINT](@/glossary/osint.md) and threat intelligence analysts, ThreatFox provides a high-quality, community-curated source of malware IOCs that is particularly strong for tracking botnet infrastructure, ransomware C2 servers, and commodity malware campaigns. Its association with abuse.ch's other projects -- URLhaus (malicious URL tracking), Malware Bazaar (malware sample repository), Feodo Tracker (banking trojan C2 tracking), and SSL Blacklist (malicious SSL certificate identification) -- provides a comprehensive malware intelligence ecosystem that covers the full lifecycle of malware operations.

ThreatFox distinguishes itself from commercial threat intelligence feeds through its community-driven model and its focus on operational IOCs that enable immediate defensive action. Every IOC in ThreatFox is submitted by a security researcher with specific context about the malware family, the role of the indicator (C2, payload delivery, data exfiltration), and its confidence level. This contextual richness makes ThreatFox particularly valuable for automated alert triage: when a security alert matches a ThreatFox IOC, the analyst immediately knows the malware family, the attack technique, and the indicator's role in the attack chain.

The platform supports multiple integration formats including its native JSON API, STIX/TAXII feeds for standardized threat intelligence sharing, bulk CSV exports for SIEM ingestion, and daily data dumps for offline processing. This flexibility makes ThreatFox suitable for environments ranging from manual analyst lookups to fully automated SOC pipelines.

## Data Sources and Coverage

ThreatFox aggregates IOCs from security researchers worldwide, with particular strength in tracking commodity malware and botnet infrastructure.

| IOC Type | Description | Volume |
|----------|-------------|--------|
| **IP:Port** | C2 server addresses with specific port numbers | Thousands active |
| **Domain** | Malicious domains used in campaigns (C2, phishing, distribution) | Thousands active |
| **URL** | Full URLs for payload delivery, phishing pages, and C2 callbacks | Thousands active |
| **MD5 Hash** | MD5 file hashes of malware samples | Growing collection |
| **SHA256 Hash** | SHA-256 file hashes of malware samples | Growing collection |

### Malware Family Coverage

| Family Category | Notable Families | IOC Types |
|----------------|-----------------|-----------|
| **Banking Trojans** | Emotet, Dridex, TrickBot, QakBot, IcedID | C2 IPs, payload URLs |
| **Ransomware** | Conti, LockBit, BlackCat, Hive, Royal | C2 IPs, negotiation sites |
| **RATs** | AsyncRAT, Remcos, NjRAT, AgentTesla, RedLine | C2 domains, payload URLs |
| **Loaders** | BumbleBee, Gootloader, SocGholish, Batloader | Distribution URLs, C2 |
| **Info Stealers** | Raccoon, Vidar, Mars, Arkei, Aurora | C2 servers, exfiltration endpoints |
| **Botnets** | Mirai, Mozi, Tsunami, Hajime | C2 infrastructure |
| **APT Tools** | CobaltStrike, Sliver, Brute Ratel, Metasploit | Beacon C2 servers |

### Threat Type Classification

| Threat Type | Description | MITRE ATT&CK Mapping |
|-------------|-------------|---------------------|
| **botnet_cc** | Botnet command-and-control server | T1071 - Application Layer Protocol |
| **cc_skimming** | Credit card skimming infrastructure | T1185 - Browser Session Hijacking |
| **payload_delivery** | Malware download and distribution URLs | T1105 - Ingress Tool Transfer |
| **exe_hash** | Executable file hash (malware sample) | T1204 - User Execution |
| **document_hash** | Malicious document hash | T1566 - Phishing |

## API Integration

ThreatFox provides a free JSON API at `https://threatfox-api.abuse.ch/api/v1/` with no authentication required for most endpoints. The API supports IOC queries, submissions, and bulk operations.

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/` (query) | POST | Query IOCs by indicator value |
| `/api/v1/` (search_ioc) | POST | Search IOCs by various criteria |
| `/api/v1/` (search_hash) | POST | Search by malware hash |
| `/api/v1/` (search_tag) | POST | Search by tag/malware family |
| `/api/v1/` (get_iocs) | POST | Get IOCs by date range |
| `/api/v1/` (submit) | POST | Submit new IOCs (requires API key) |
| `/api/v1/` (malware) | POST | Get all IOCs for a malware family |
| `/api/v1/` (taginfo) | POST | Get IOC count per tag |
| `/export/json/recent/` | GET | Recent IOCs in JSON format |
| `/export/csv/recent/` | GET | Recent IOCs in CSV format |
| `/downloads/` | GET | Bulk data dumps (full database) |

### Integration Formats

| Format | Endpoint | Use Case |
|--------|----------|----------|
| **JSON API** | `/api/v1/` | Programmatic lookups and queries |
| **STIX/TAXII** | TAXII server at abuse.ch | Standardized TI sharing integration |
| **CSV Export** | `/export/csv/` | SIEM rule generation, blocklist import |
| **JSON Export** | `/export/json/` | Automated pipeline ingestion |
| **Daily Dump** | `/downloads/` | Offline analysis, local mirror |

## Query Examples

### curl Examples

```bash
# Query a specific indicator
curl -X POST "https://threatfox-api.abuse.ch/api/v1/" \
  -d '{"query": "search_ioc", "search_term": "1.2.3.4"}'

# Get all IOCs for a malware family
curl -X POST "https://threatfox-api.abuse.ch/api/v1/" \
  -d '{"query": "malwareinfo", "malware": "win.cobalt_strike"}'

# Search by tag
curl -X POST "https://threatfox-api.abuse.ch/api/v1/" \
  -d '{"query": "taginfo", "tag": "CobaltStrike"}'

# Get recent IOCs (last 3 days)
curl -X POST "https://threatfox-api.abuse.ch/api/v1/" \
  -d '{"query": "get_iocs", "days": 3}'

# Search by malware hash
curl -X POST "https://threatfox-api.abuse.ch/api/v1/" \
  -d '{"query": "search_hash", "hash": "abc123def456..."}'

# Submit a new IOC (requires API key)
curl -X POST "https://threatfox-api.abuse.ch/api/v1/" \
  -d '{
    "query": "submit_ioc",
    "threat_type": "botnet_cc",
    "ioc_type": "ip:port",
    "malware": "win.cobalt_strike",
    "confidence_level": 75,
    "reference": "https://example.com/analysis",
    "tags": ["CobaltStrike", "beacon"],
    "iocs": ["1.2.3.4:443", "5.6.7.8:8080"],
    "auth_key": "YOUR_API_KEY"
  }'

# Download recent IOCs as CSV (for SIEM import)
curl -O "https://threatfox.abuse.ch/export/csv/recent/"

# Download full IOC database
curl -O "https://threatfox.abuse.ch/downloads/threatfox_full.json.zip"
```

### Elixir Integration

```elixir
# Query a specific indicator
{:ok, ioc} = PrismaticOsint.ThreatFox.query("1.2.3.4:443")
# => %{
#   id: "12345",
#   ioc: "1.2.3.4:443",
#   ioc_type: "ip:port",
#   threat_type: "botnet_cc",
#   malware: "win.cobalt_strike",
#   malware_printable: "CobaltStrike",
#   confidence_level: 90,
#   first_seen: ~U[2026-01-15 10:30:00Z],
#   last_seen: ~U[2026-02-10 08:15:00Z],
#   reporter: "abuse_ch",
#   tags: ["CobaltStrike", "beacon", "c2"],
#   reference: "https://example.com/analysis",
#   malware_malpedia: "https://malpedia.caad.fkie.fraunhofer.de/details/win.cobalt_strike"
# }

# Get all IOCs for a malware family
{:ok, iocs} = PrismaticOsint.ThreatFox.by_malware("win.cobalt_strike",
  limit: 100
)
# => %{
#   malware: "win.cobalt_strike",
#   total: 2347,
#   iocs: [
#     %{ioc: "1.2.3.4:443", type: "ip:port", confidence: 90,
#       first_seen: ~U[2026-01-15 10:30:00Z]},
#     %{ioc: "evil-domain.com", type: "domain", confidence: 85,
#       first_seen: ~U[2026-01-20 14:00:00Z]}
#   ]
# }

# Get recent IOCs for threat feed integration
{:ok, recent} = PrismaticOsint.ThreatFox.recent(days: 1)
# => %{total: 234, iocs: [...]}

# Search by tag
{:ok, tagged} = PrismaticOsint.ThreatFox.by_tag("Emotet", limit: 50)

# Bulk lookup for incident response triage
indicators = ["1.2.3.4", "evil.com", "abc123..."]
{:ok, results} = PrismaticOsint.ThreatFox.bulk_lookup(indicators)
# => [%{indicator: "1.2.3.4", found: true, malware: "CobaltStrike", confidence: 90},
#     %{indicator: "evil.com", found: true, malware: "Emotet", confidence: 85},
#     %{indicator: "abc123...", found: false}]

# Submit verified IOCs from investigation
{:ok, submission} = PrismaticOsint.ThreatFox.submit([
  %{ioc: "9.8.7.6:4443", type: "ip:port", malware: "win.cobalt_strike",
    threat_type: "botnet_cc", confidence: 80, tags: ["CobaltStrike"]}
])

# Cross-reference with other abuse.ch services
{:ok, enriched} = PrismaticOsint.Pipeline.abuse_ch_enrichment("1.2.3.4",
  sources: [:threatfox, :urlhaus, :feodotracker, :sslbl]
)
```

## Data Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique ThreatFox IOC identifier |
| `ioc` | string | Indicator value (IP:port, domain, URL, hash) |
| `ioc_type` | enum | `ip:port`, `domain`, `url`, `md5_hash`, `sha256_hash` |
| `threat_type` | enum | `botnet_cc`, `cc_skimming`, `payload_delivery`, `exe_hash`, `document_hash` |
| `threat_type_desc` | string | Human-readable threat type description |
| `malware` | string | Malware family identifier (Malpedia format: `win.cobalt_strike`) |
| `malware_printable` | string | Human-readable malware name |
| `malware_alias` | string | Alternative names for the malware |
| `malware_malpedia` | string | URL to Malpedia entry for the malware |
| `confidence_level` | integer | Confidence score (0-100) |
| `first_seen_utc` | datetime | First observation timestamp |
| `last_seen_utc` | datetime | Most recent observation timestamp |
| `reporter` | string | Username of the IOC submitter |
| `reference` | string | URL to analysis or report |
| `tags` | array | Associated tags (malware names, techniques, campaigns) |
| `ioc_id` | integer | Internal IOC identifier |

## Use Cases

### SOC Alert Enrichment

When security operations centers receive alerts from firewalls, IDS/IPS, or endpoint detection tools, ThreatFox provides immediate context for observed indicators. Matching an alert against ThreatFox reveals the malware family involved, the role of the indicator in the attack chain (C2 server, payload delivery, exfiltration endpoint), and the confidence level of the attribution. This context enables rapid triage and prioritization of security alerts.

### Threat Feed Integration

ThreatFox's structured IOC data integrates directly into SIEMs, firewalls, and threat intelligence platforms as a high-quality blocking feed. The CSV export format is compatible with most SIEM platforms, while STIX/TAXII integration enables standardized threat intelligence sharing with TIP platforms like MISP, OpenCTI, and commercial alternatives.

### Malware Campaign Tracking

By querying all IOCs associated with a specific malware family, analysts track the infrastructure evolution of malware campaigns over time. This reveals new C2 servers as they come online, infrastructure rotation patterns, and the geographic distribution of command-and-control infrastructure.

### Incident Response Triage

During incident response, ThreatFox enables rapid identification of malware families from observed network indicators. When forensic analysis reveals outbound connections to suspicious IPs or domains, ThreatFox lookups immediately identify the malware family and provide links to detailed analysis reports.

### Proactive Blocking

Organizations integrate ThreatFox's daily feed into their firewalls and proxy servers to proactively block connections to known C2 infrastructure. The confidence scoring enables tiered blocking: high-confidence IOCs are blocked automatically, while medium-confidence IOCs trigger alerts for manual review.

### Red Team Detection

ThreatFox's extensive coverage of offensive security tool C2 infrastructure (CobaltStrike, Sliver, Brute Ratel) enables blue teams to detect red team and adversary use of these tools through C2 beacon detection and infrastructure matching.

## Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Community-dependent quality** | IOC quality varies by submitter | Use confidence scores for filtering; validate high-impact IOCs |
| **Focus on commodity malware** | APT and targeted attack coverage limited | Supplement with commercial threat intelligence feeds |
| **No enrichment** | Raw IOCs without passive DNS, WHOIS, or infrastructure context | Enrich with [Pulsedive](@/osint/pulsedive.md), [VirusTotal](@/osint/virustotal.md) |
| **Time-limited relevance** | C2 infrastructure rotates frequently; IOCs may become stale | Focus on recent IOCs; implement time-based expiration |
| **Limited historical analysis** | Database focused on active threats, not historical campaigns | Use [MISP](@/osint/misp.md) for long-term threat tracking |
| **False positive risk** | Some IOCs may be shared hosting or CDN IPs | Validate context before blocking; check for shared infrastructure |

## Legal and Ethical Considerations

**Open Source Intelligence**: ThreatFox data is freely available for defensive security purposes. All IOCs are contributed by security researchers voluntarily, and the platform is explicitly designed to support community defense against malware.

**IOC Submission Ethics**: When submitting IOCs to ThreatFox, ensure the indicators are from legitimate security research and analysis. Do not submit indicators from unauthorized access or compromised systems without proper authorization.

**Blocking Considerations**: Before implementing ThreatFox IOCs as blocking rules, validate that the indicators are not shared hosting IPs or CDN addresses that could cause collateral blocking of legitimate services.

**Attribution Limitations**: ThreatFox provides malware family attribution but not threat actor attribution. Malware family identification should not be conflated with attribution to specific nation-state or criminal groups without additional corroborating intelligence.

## Integration with Prismatic Platform

Within the [Prismatic Platform](@/apps/prismatic.md), ThreatFox serves as a specialized malware intelligence source within the threat intelligence pipeline.

- **IOC Enrichment**: ThreatFox data is automatically queried during IOC enrichment, providing malware family attribution and confidence scoring for observed indicators.
- **Cross-Source Validation**: ThreatFox IOCs are cross-referenced with [AlienVault OTX](@/osint/alienvault-otx.md), [VirusTotal](@/osint/virustotal.md), [Pulsedive](@/osint/pulsedive.md), and [AbuseIPDB](@/osint/abuseipdb.md) for multi-source validation.
- **Abuse.ch Ecosystem**: The platform integrates ThreatFox alongside URLhaus, Malware Bazaar, and Feodo Tracker for comprehensive abuse.ch intelligence coverage.
- **Feed Synchronization**: Daily ThreatFox feeds are synchronized to the platform's local threat intelligence database for low-latency lookups.
- **MITRE ATT&CK Mapping**: ThreatFox's technique identifiers feed into the platform's ATT&CK coverage analysis, showing which techniques are actively observed in the threat landscape.
- **Alert Classification**: ThreatFox malware family tagging enables automated classification of security alerts, reducing analyst triage time.

## Best Practices

1. **Filter by confidence level**: Use ThreatFox's confidence scores to implement tiered responses -- block high-confidence IOCs automatically, alert on medium-confidence IOCs for manual review.

2. **Implement time-based expiration**: C2 infrastructure rotates frequently. Set expiration periods for ThreatFox IOCs in your blocking rules (e.g., 30-90 days for IP addresses, longer for domains).

3. **Cross-reference before blocking**: Before blocking an IP or domain from ThreatFox, verify it is not a shared hosting IP or CDN address that could cause collateral damage.

4. **Subscribe to daily feeds**: Rather than querying individual IOCs, subscribe to ThreatFox's daily export for comprehensive, up-to-date coverage.

5. **Contribute back**: If your incident response or threat hunting activities identify new C2 infrastructure, submit verified IOCs back to ThreatFox to strengthen community defense.

6. **Use Malpedia links**: ThreatFox includes links to Malpedia entries for each malware family. Use these links to understand malware capabilities and TTPs.

7. **Combine with abuse.ch ecosystem**: ThreatFox is most powerful when used alongside URLhaus (for URL context), Malware Bazaar (for sample analysis), and Feodo Tracker (for banking trojan specifics).

## Related Providers

- [AlienVault OTX](@/osint/alienvault-otx.md) - Community threat intelligence with pulses
- [VirusTotal](@/osint/virustotal.md) - Multi-engine malware analysis for hash validation
- [Pulsedive](@/osint/pulsedive.md) - Threat intelligence enrichment and risk scoring
- [AbuseIPDB](@/osint/abuseipdb.md) - IP abuse reporting and reputation
- [MISP](@/osint/misp.md) - Structured threat intelligence sharing platform
- [GreyNoise](@/osint/greynoise.md) - Scanner and noise identification
- [URLScan](@/osint/urlscan.md) - URL and website analysis

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)