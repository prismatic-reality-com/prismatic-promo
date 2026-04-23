+++
title = "VirusTotal"
weight = 3
[extra]
category = "global"
type = "threat"
module = "Virustotal"
description = "Multi-antivirus scanning service with 70+ security vendors"
has_api = true
url = "https://virustotal.com"
rate_limit = "4 req/min (free), 1000 req/day (premium)"
capabilities = ["File Scanning", "URL Analysis", "Domain Reputation", "IP Intelligence", "Behavior Analysis", "YARA Rules"]
keywords = ["VirusTotal malware analysis", "multi-antivirus scanning service", "threat intelligence platform", "file hash reputation check", "YARA rule hunting", "malware behavior analysis", "domain reputation scoring", "Google threat intelligence"]
tags = ["osint", "virustotal", "malware", "threat-intelligence"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1615
date_created = "2026-02-23"
date_modified = "2026-02-23"
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "VirusTotal - Prismatic Platform"
+++

## Overview

VirusTotal is Google's comprehensive malware analysis and [threat intelligence](@/glossary/threat-intelligence.md) platform that aggregates results from over 70 antivirus engines and website scanners into a unified interface. Since its founding in 2004 by Hispasec Sistemas and its acquisition by Google in 2012, VirusTotal has become the de facto standard for malware analysis, indicator enrichment, and file reputation checking in the security industry. The platform processes over two million file submissions and URL scans daily, building a massive database of threat intelligence that spans files, URLs, domains, and IP addresses.

For [OSINT](@/glossary/osint.md) investigators and security professionals, VirusTotal provides multi-dimensional intelligence. A single file hash query reveals detection rates across 70+ antivirus engines, sandbox behavioral analysis, static file metadata, embedded indicators (URLs, IPs, domains), and relationships to other analyzed samples. Similarly, domain and IP queries reveal reputation scores, passive DNS history, downloaded files, communicating files, and certificate information. This depth of intelligence makes VirusTotal indispensable for threat investigation, incident response, and indicator enrichment.

VirusTotal's VT Intelligence service extends the platform with advanced capabilities including content search (searching within the bodies of submitted files), YARA hunting (real-time matching of YARA rules against incoming submissions), retrohunting (matching rules against the historical database), and file similarity analysis. These capabilities transform VirusTotal from a lookup service into a proactive threat hunting platform that can discover new malware families, track campaign evolution, and identify emerging threats before they are widely detected.

The platform's Graph feature enables visual exploration of relationships between files, domains, IPs, and URLs, allowing analysts to map the complete infrastructure and delivery chain of malware campaigns. VirusTotal's relational data model connects files to the domains they contact, the IPs they communicate with, the URLs they were downloaded from, and other files that share similar characteristics.

## Data Sources and Coverage

VirusTotal aggregates intelligence from multiple analysis and detection engines, providing comprehensive multi-source coverage.

| Source Category | Examples | Coverage |
|----------------|---------|----------|
| **Antivirus Engines** | Kaspersky, Bitdefender, ESET, CrowdStrike, Microsoft, Sophos | 70+ engines |
| **Sandbox Analysis** | VirusTotal Jujubox, Zenbox, Dr.Web vxCube, Tencent HABO | Multiple sandboxes |
| **URL Scanners** | Google Safe Browsing, Phishtank, CLEAN MX, OpenPhish | 80+ URL scanners |
| **WHOIS Providers** | Direct [WHOIS](@/glossary/whois.md) lookups with historical tracking | All gTLDs, major ccTLDs |
| **Passive DNS** | Historical DNS resolution from VirusTotal sensors | Global coverage |
| **Sigma Rules** | Community Sigma detection rules for behavioral matching | Extensive ruleset |
| **YARA Rules** | Custom and community YARA rules for content matching | VT Intelligence feature |
| **IDS Rules** | Snort and Suricata rule matching against network behavior | Community rulesets |

### Analysis Dimensions

| Dimension | File Analysis | URL/Domain Analysis | IP Analysis |
|-----------|--------------|-------------------|-------------|
| **Detection** | AV engine verdicts | URL scanner verdicts | Reputation scores |
| **Behavior** | Sandbox execution results | HTTP response analysis | Communicating files |
| **Relationships** | Contacted domains/IPs, dropped files | Downloaded files, redirects | Hosted URLs, certificates |
| **Metadata** | PE/ELF headers, strings, imports | HTTP headers, content type | ASN, geolocation, WHOIS |
| **Historical** | First/last submission dates | URL history | Resolution history |
| **Community** | Votes, comments, tags | Community notes | Community intelligence |

## API Integration

VirusTotal provides a comprehensive REST API at `https://www.virustotal.com/api/v3/` with JSON responses. Authentication uses API key in the `x-apikey` header.

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/files/{id}` | GET | Get file analysis report by hash |
| `/files` | POST | Upload file for analysis |
| `/files/{id}/behaviours` | GET | Get sandbox behavior reports |
| `/files/{id}/relationships/{type}` | GET | Get file relationships |
| `/urls` | POST | Submit URL for scanning |
| `/urls/{id}` | GET | Get URL analysis report |
| `/domains/{domain}` | GET | Get domain report |
| `/ip_addresses/{ip}` | GET | Get IP address report |
| `/search` | GET | Search with VT Query Language |
| `/intelligence/search` | GET | VT Intelligence search (premium) |
| `/intelligence/hunting_rulesets` | POST | Create YARA hunting ruleset |

### Rate Limits by Plan

| Plan | Lookups/Day | Submissions/Day | Features | Price |
|------|------------|----------------|----------|-------|
| **Free** | 500 | 100 | Basic API, standard lookups | $0 |
| **Premium** | 20,000 | 2,000 | Full API, no rate limit per minute | Custom |
| **VT Intelligence** | Unlimited | Unlimited | Content search, YARA, hunting | Custom |
| **VT Enterprise** | Unlimited | Unlimited | Private scanning, SLA, on-premise | Custom |

## Query Examples

### curl Examples

```bash
# Get file report by SHA-256 hash
curl -H "x-apikey: YOUR_KEY" \
  "https://www.virustotal.com/api/v3/files/abc123def456..."

# Upload a file for scanning
curl -X POST -H "x-apikey: YOUR_KEY" \
  --form "file=@/path/to/sample.exe" \
  "https://www.virustotal.com/api/v3/files"

# Submit a URL for scanning
curl -X POST -H "x-apikey: YOUR_KEY" \
  --form "url=https://suspicious-site.com" \
  "https://www.virustotal.com/api/v3/urls"

# Get domain report
curl -H "x-apikey: YOUR_KEY" \
  "https://www.virustotal.com/api/v3/domains/example.com"

# Get IP address report
curl -H "x-apikey: YOUR_KEY" \
  "https://www.virustotal.com/api/v3/ip_addresses/1.2.3.4"

# Get file behavior (sandbox) report
curl -H "x-apikey: YOUR_KEY" \
  "https://www.virustotal.com/api/v3/files/abc123.../behaviours"

# Search for files communicating with a domain
curl -H "x-apikey: YOUR_KEY" \
  "https://www.virustotal.com/api/v3/files/abc123.../relationships/contacted_domains"

# VT Intelligence search (premium)
curl -H "x-apikey: YOUR_KEY" \
  "https://www.virustotal.com/api/v3/intelligence/search?query=type:peexe+positives:5%2B"

# Get passive DNS for a domain
curl -H "x-apikey: YOUR_KEY" \
  "https://www.virustotal.com/api/v3/domains/example.com/relationships/resolutions"

# Get files downloaded from a URL
curl -H "x-apikey: YOUR_KEY" \
  "https://www.virustotal.com/api/v3/urls/{url_id}/relationships/downloaded_files"
```

### VT Query Language

```bash
# Files detected by specific engines
engines:kaspersky positives:1+

# Specific file type with detections
type:pdf tag:exploit positives:5+

# Search by malware signature name
signature:"Trojan.Generic"

# Behavioral indicators
behavior:"Creates mutex" behavior:"Modifies registry"

# Content search (VT Intelligence)
content:"password" type:doc

# Files communicating with specific domain
itw:evil-domain.com

# YARA-matched files
yara:rule_name

# Files first seen in date range
fs:2026-01-01+ ls:2026-02-01-

# By submitter country
submitter:CZ type:peexe
```

### Elixir Integration

```elixir
# Get file analysis report
{:ok, report} = PrismaticOsint.VirusTotal.file_report("abc123def456...")
# => %{
#   sha256: "abc123def456...",
#   sha1: "...",
#   md5: "...",
#   type_description: "Win32 EXE",
#   size: 245_760,
#   first_submission: ~U[2025-06-15 10:00:00Z],
#   last_analysis_date: ~U[2026-02-10 14:30:00Z],
#   detection_stats: %{malicious: 45, undetected: 25, suspicious: 2},
#   popular_threat_name: "trojan.emotet/agent",
#   sandbox_verdicts: [
#     %{sandbox: "Zenbox", verdict: "malicious",
#       activities: ["Creates mutex", "Contacts C2 server", "Drops executable"]}
#   ],
#   contacted_domains: ["evil-c2.com", "backup-c2.org"],
#   contacted_ips: ["1.2.3.4", "5.6.7.8"],
#   tags: ["peexe", "overlay", "signed"]
# }

# Check URL reputation
{:ok, url_report} = PrismaticOsint.VirusTotal.url_report("https://suspicious-site.com")
# => %{
#   url: "https://suspicious-site.com",
#   last_analysis: %{malicious: 12, harmless: 55, undetected: 15},
#   categories: ["malware", "phishing"],
#   final_url: "https://suspicious-site.com/landing",
#   redirects: ["https://redirect1.com"],
#   downloaded_files: [%{sha256: "...", detection_ratio: "35/70"}]
# }

# Get domain intelligence
{:ok, domain} = PrismaticOsint.VirusTotal.domain("example.com")
# => %{
#   domain: "example.com",
#   reputation: -15,
#   whois: %{registrar: "...", created: "..."},
#   dns_records: [%{type: "A", value: "1.2.3.4"}],
#   communicating_files: %{count: 234, malicious: 45},
#   downloaded_files: %{count: 12, malicious: 8},
#   subdomains: ["www", "mail", "cdn"],
#   categories: %{fortinet: "Malware", sophos: "Spyware"}
# }

# Search for related samples
{:ok, results} = PrismaticOsint.VirusTotal.search(
  "type:peexe positives:5+ tag:signed fs:2026-01-01+",
  limit: 50
)

# Upload and scan a file
{:ok, scan} = PrismaticOsint.VirusTotal.scan_file("/path/to/suspicious.exe")

# Bulk IOC enrichment pipeline
indicators = ["1.2.3.4", "evil.com", "abc123...", "https://phish.com"]
{:ok, enriched} = PrismaticOsint.VirusTotal.bulk_enrich(indicators)

# Cross-source threat investigation
{:ok, investigation} = PrismaticOsint.Pipeline.threat_investigation("abc123...",
  sources: [:virustotal, :threatfox, :alienvault_otx, :pulsedive, :misp]
)
```

## Data Schema

| Field | Type | Description |
|-------|------|-------------|
| `attributes.sha256` | string | SHA-256 hash |
| `attributes.sha1` | string | SHA-1 hash |
| `attributes.md5` | string | MD5 hash |
| `attributes.size` | integer | File size in bytes |
| `attributes.type_description` | string | File type description |
| `attributes.type_tag` | string | Short file type tag |
| `attributes.meaningful_name` | string | Original filename (if available) |
| `attributes.first_submission_date` | integer | Unix timestamp of first upload |
| `attributes.last_analysis_date` | integer | Unix timestamp of last analysis |
| `attributes.last_analysis_stats` | object | Detection counts by category |
| `attributes.popular_threat_classification` | object | Most common detection name |
| `attributes.sandbox_verdicts` | object | Sandbox analysis results |
| `attributes.tags` | array | Automated tags |
| `attributes.sigma_analysis_stats` | object | Sigma rule match counts |
| `attributes.pe_info` | object | PE file header information |
| `attributes.trid` | array | File type identification results |
| `relationships.contacted_domains` | array | Domains contacted during execution |
| `relationships.contacted_ips` | array | IPs contacted during execution |
| `relationships.contacted_urls` | array | URLs accessed during execution |
| `relationships.dropped_files` | array | Files created during execution |
| `relationships.parents` | array | Files that contain or drop this file |
| `relationships.similar_files` | array | Files with similar characteristics |

## Use Cases

### Incident Response and Forensics

VirusTotal is the first-stop tool during incident response for rapidly assessing whether observed files, URLs, domains, or IP addresses are known threats. A hash lookup instantly reveals whether a suspicious file has been seen before, which AV engines detect it, and what behavioral characteristics it exhibits. This enables rapid triage of potentially compromised systems.

### Threat Hunting

VT Intelligence enables proactive threat hunting through content search, YARA rules, and behavioral analysis. Security teams deploy YARA rules that match on specific code patterns, string artifacts, or binary structures, receiving notifications when matching files are submitted. This enables early detection of new malware variants and campaign tracking.

### Malware Family Tracking

By monitoring detection patterns and behavioral characteristics over time, analysts track the evolution of malware families. VirusTotal's submission timeline, detection rate changes, and relationship data reveal how malware campaigns evolve, when new variants emerge, and how infrastructure changes.

### Alert Enrichment

Security operations centers integrate VirusTotal with SIEM and SOAR platforms to automatically enrich security alerts with multi-engine detection context. Alerts involving files or indicators with high VirusTotal detection rates are prioritized for investigation, while clean indicators are deprioritized.

### Supply Chain Security

VirusTotal's file analysis capabilities enable verification of software supply chain integrity. Organizations submit downloaded software, patches, and updates to VirusTotal to verify they are not trojanized before deployment. The platform's retrohunting capability can identify previously undetected supply chain compromises.

### Phishing Investigation

URL and domain analysis capabilities enable investigation of phishing campaigns. VirusTotal reveals the detection rate of phishing URLs across multiple scanners, the hosting infrastructure, downloaded payloads, and relationships to other phishing domains in the same campaign.

## Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Free tier rate limits** | 4 requests/minute, 500 lookups/day limits automated integration | Premium plans for production; implement caching |
| **Detection != maliciousness** | Low detection rates may indicate new threats, not benign files | Use behavioral analysis alongside AV detection rates |
| **Submission privacy** | Files uploaded to VT become available to premium users | Use hash lookups for sensitive files; never upload proprietary files |
| **AV engine quality varies** | Some engines produce more false positives than others | Weight detections by engine reputation; use community intelligence |
| **Sandbox evasion** | Sophisticated malware may detect and evade sandbox analysis | Combine VT sandbox with dedicated malware analysis tools |
| **No real-time protection** | VirusTotal is analytical, not preventive | Use VT for investigation; deploy endpoint protection for real-time defense |

## Legal and Ethical Considerations

**File Sharing Awareness**: Files submitted to VirusTotal are shared with participating antivirus vendors and are accessible to VT Intelligence subscribers. Never submit files containing sensitive, proprietary, or classified information. Use hash lookups for sensitive indicators.

**Terms of Service**: VirusTotal's terms prohibit using the service for automated malware distribution or weaponization research. Use the platform for defensive security purposes only.

**Responsible Disclosure**: If VirusTotal analysis reveals previously unknown malware or campaign infrastructure, consider responsible disclosure to affected parties and relevant CERTs before publishing findings.

**Privacy Considerations**: VirusTotal submissions may contain metadata (filenames, paths, submission sources) that could reveal information about the submitter's environment. Be aware of operational security when submitting files from sensitive environments.

## Integration with Prismatic Platform

Within the [Prismatic Platform](@/apps/prismatic.md), VirusTotal serves as the primary multi-engine malware analysis and file reputation service.

- **IOC Enrichment**: All file hashes, URLs, domains, and IPs discovered during investigations are automatically enriched with VirusTotal intelligence, including detection rates, behavioral analysis, and relationship data.
- **Threat Intelligence Pipeline**: VirusTotal detection data is correlated with [ThreatFox](@/osint/threatfox.md), [AlienVault OTX](@/osint/alienvault-otx.md), and [Pulsedive](@/osint/pulsedive.md) for multi-source threat validation.
- **Malware Analysis**: The platform's investigation workflow integrates VirusTotal sandbox results alongside [MISP](@/osint/misp.md) structured intelligence for comprehensive malware analysis.
- **Infrastructure Investigation**: VirusTotal's domain and IP intelligence feeds into [Prismatic Perimeter](@/apps/prismatic-perimeter.md) for identifying potentially compromised infrastructure.
- **Alert Enrichment**: Security alerts are automatically enriched with VirusTotal context, enabling rapid triage based on multi-engine detection consensus.
- **YARA Integration**: The platform supports YARA rule deployment to VT Intelligence for proactive threat hunting aligned with organizational threat models.

## Best Practices

1. **Never upload sensitive files**: Use hash lookups instead of file uploads for sensitive or proprietary files. Hash lookups are private; file uploads are shared.

2. **Check behavioral analysis**: Detection rates alone are insufficient. Always review sandbox behavioral reports for understanding what malware actually does.

3. **Use relationships for investigation**: VirusTotal's relationship data (contacted domains, dropped files, similar samples) is often more valuable than detection rates for investigation purposes.

4. **Weight detection quality**: Not all AV engines are equal. Pay more attention to detections from engines with strong track records (Kaspersky, Bitdefender, ESET, CrowdStrike) than engines known for false positives.

5. **Check first submission date**: A file's first submission date indicates when it was first observed. Recent first-seen dates suggest newly deployed malware.

6. **Use VT Graph for campaigns**: The Graph feature enables visual mapping of malware campaigns through file-domain-IP relationships.

7. **Implement caching**: VirusTotal data changes slowly for most indicators. Cache results for 24-48 hours to maximize API quota efficiency.

8. **Combine with specialized sources**: Use VirusTotal for broad coverage, then consult [ThreatFox](@/osint/threatfox.md) for malware family context and [MISP](@/osint/misp.md) for structured threat intelligence.

## Related Providers

- [ThreatFox](@/osint/threatfox.md) - IOC sharing with malware family attribution
- [AlienVault OTX](@/osint/alienvault-otx.md) - Community threat intelligence with pulses
- [Pulsedive](@/osint/pulsedive.md) - Threat intelligence enrichment and risk scoring
- [MISP](@/osint/misp.md) - Structured threat intelligence sharing platform
- [AbuseIPDB](@/osint/abuseipdb.md) - IP reputation for infrastructure analysis
- [Shodan](@/osint/shodan.md) - Internet device search for infrastructure context
- [URLScan](@/osint/urlscan.md) - URL analysis with screenshots and DOM inspection
- [Have I Been Pwned](@/osint/haveibeenpwned.md) - Breach data correlation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)