+++
title = "SpiderFoot"
weight = 46
[extra]
category = "global"
type = "osint"
module = "SpiderFoot"
description = "Automated OSINT collection and reconnaissance framework"
has_api = true
url = "https://spiderfoot.net"
rate_limit = "Self-hosted (unlimited), HX cloud (plan-dependent)"
capabilities = ["Automated Recon", "200+ Data Sources", "Attack Surface Mapping", "Dark Web Scanning", "Data Breach Detection", "Correlation Engine"]
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1741
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["SpiderFoot", "Automated", "OSINT", "global", "Prismatic Platform"]
tags = ["osint", "global", "spiderfoot", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "SpiderFoot - Prismatic Platform"
+++

## Overview

SpiderFoot is an open-source intelligence automation framework that queries over 200 data sources to gather intelligence on IP addresses, domains, email addresses, names, and other entities. Created by Steve Micallef, SpiderFoot automates the tedious process of collecting [OSINT](/glossary/osint/) by chaining queries across multiple sources and correlating results into a unified investigation view. Available as both open-source (self-hosted) and a commercial cloud service (SpiderFoot HX), it represents one of the most comprehensive automated reconnaissance platforms available.

For OSINT investigators, SpiderFoot eliminates the manual process of querying dozens of individual data sources and correlating results. A single scan target -- whether an IP address, domain name, email address, phone number, or person's name -- triggers automated queries across all relevant data sources, with results cross-referenced and linked through the platform's correlation engine. This automation transforms what would be hours of manual investigation into a systematic, repeatable process that ensures no relevant data source is overlooked.

SpiderFoot's architecture is modular, with each data source integration implemented as an independent module. This design enables rapid addition of new sources and customization of scan scope. Modules can be enabled or disabled per scan, allowing analysts to tailor reconnaissance depth to specific investigation requirements. The platform supports both passive reconnaissance (querying external databases without touching the target) and active scanning modes (directly probing target infrastructure).

The platform's correlation engine is its key differentiator from simple multi-source query tools. When SpiderFoot discovers an entity (an IP address, domain, email, or hostname), it automatically feeds that entity into all applicable modules, creating a recursive discovery process. A domain scan might discover subdomains, which resolve to IPs, which reveal co-hosted domains, which lead to additional email addresses, which appear in breach databases. This recursive expansion maps the complete intelligence picture from a single starting point.

## Data Sources and Coverage

SpiderFoot integrates with over 200 data sources across multiple intelligence categories.

| Category | Module Count | Examples | Data Types |
|----------|-------------|----------|------------|
| **DNS Intelligence** | 15+ | [SecurityTrails](/osint/securitytrails/), [DNSDumpster](/osint/dnsdumpster/), [ViewDNS](/osint/viewdns/) | Subdomains, DNS records, zone transfers |
| **WHOIS & Registration** | 10+ | [WhoisXML](/osint/whoisxml/), DomainTools, ARIN/RIPE | Registrant data, registration history |
| **Threat Intelligence** | 20+ | [VirusTotal](/osint/virustotal/), [AlienVault OTX](/osint/alienvault-otx/), [ThreatFox](/osint/threatfox/) | Malware, C2, blocklists |
| **Internet Scanning** | 10+ | [Shodan](/osint/shodan/), [Censys](/osint/censys/), [ZoomEye](/osint/zoomeye/) | Open ports, services, vulnerabilities |
| **Dark Web** | 5+ | Tor, I2P, .onion scanning, dark web search | Dark web mentions, hidden services |
| **Breach Intelligence** | 10+ | [Have I Been Pwned](/osint/haveibeenpwned/), [Intelligence X](/osint/intelx/), DeHashed | Leaked credentials, exposed data |
| **Social Media** | 10+ | Twitter, LinkedIn, GitHub, Reddit | Profiles, posts, repositories |
| **Geolocation** | 5+ | [MaxMind](/osint/maxmind/), IPInfo, IP2Location | IP geolocation, ASN data |
| **Email Intelligence** | 10+ | [Hunter.io](/osint/hunter-io/), EmailRep, email validation | Email discovery, verification, reputation |
| **Certificate Intelligence** | 5+ | [crt.sh](/osint/crtsh/), CertSpotter, SSL Labs | Certificate history, transparency logs |
| **Search Engines** | 5+ | Google, Bing, DuckDuckGo, Baidu | Cached content, indexed pages |
| **Code Repositories** | 5+ | GitHub, GitLab, Bitbucket | Code leaks, secret exposure |
| **Passive DNS** | 5+ | [PassiveDNS](/osint/passivedns/), CIRCL, Farsight | Historical DNS resolution |
| **Web Analysis** | 10+ | [BuiltWith](/osint/builtwith/), Wappalyzer, web scrapers | Technology detection, content analysis |

### Scan Target Types

| Target Type | Description | Module Activation |
|-------------|-------------|-------------------|
| **IP Address** | Single IPv4 or IPv6 address | Port scanning, geolocation, reverse DNS, blocklist checks |
| **Domain** | Fully qualified domain name | DNS, WHOIS, subdomains, certificates, web analysis |
| **Subnet** | CIDR notation network range | All hosts in range, network ownership |
| **Email** | Email address | Breach checks, social profiles, domain analysis |
| **Phone** | Phone number | Caller ID, social profiles, carrier lookup |
| **Username** | Online username | Cross-platform profile discovery |
| **Person Name** | Full name | Social media, public records, news mentions |
| **Bitcoin Address** | Cryptocurrency address | Transaction analysis, exchange attribution |
| **ASN** | Autonomous System Number | Network ownership, IP ranges, peering |

## API Integration

SpiderFoot provides both a web UI and a REST API for scan management and result retrieval. The self-hosted version runs on `http://localhost:5001` by default.

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/scans` | GET | List all scans |
| `/api/scan/new` | POST | Start a new scan |
| `/api/scan/{id}/status` | GET | Get scan status |
| `/api/scan/{id}/data` | GET | Get scan results |
| `/api/scan/{id}/data/type/{type}` | GET | Get results by data type |
| `/api/scan/{id}/delete` | DELETE | Delete a scan |
| `/api/scan/{id}/stop` | POST | Stop a running scan |
| `/api/scan/{id}/export/csv` | GET | Export results as CSV |
| `/api/scan/{id}/export/json` | GET | Export results as JSON |
| `/api/modules` | GET | List available modules |
| `/api/types` | GET | List data types |

### Deployment Options

| Option | Cost | Features | Best For |
|--------|------|----------|----------|
| **Open Source** | Free | Self-hosted, CLI + web UI, all modules, full customization | Security teams, researchers |
| **SpiderFoot HX** | From $100/mo | Cloud-hosted, team collaboration, scheduling, API, SLA | Enterprise teams |
| **Docker** | Free | Containerized deployment, easy setup | DevSecOps integration |

## Query Examples

### curl Examples

```bash
# Start a new scan (self-hosted)
curl -X POST "http://localhost:5001/api/scan/new" \
  -H "Content-Type: application/json" \
  -d '{"scanname": "Example Corp Recon", "scantarget": "example.com", "usecase": "all", "modules": ""}'

# List all scans
curl "http://localhost:5001/api/scans"

# Get scan status
curl "http://localhost:5001/api/scan/SCAN_ID/status"

# Get scan results
curl "http://localhost:5001/api/scan/SCAN_ID/data"

# Get results filtered by type (e.g., email addresses)
curl "http://localhost:5001/api/scan/SCAN_ID/data/type/EMAILADDR"

# Export scan results as JSON
curl "http://localhost:5001/api/scan/SCAN_ID/export/json" > results.json

# Stop a running scan
curl -X POST "http://localhost:5001/api/scan/SCAN_ID/stop"

# Delete a scan
curl -X DELETE "http://localhost:5001/api/scan/SCAN_ID/delete"

# List available modules
curl "http://localhost:5001/api/modules"

# Docker deployment
docker run -p 5001:5001 spiderfoot/spiderfoot
```

### Elixir Integration

```elixir
# Start an automated full-scope scan
{:ok, scan} = PrismaticOsint.SpiderFoot.scan("example.com",
  name: "Example Corp Reconnaissance",
  modules: :all,
  use_case: :all
)
# => %{id: "scan_abc123", status: "running", target: "example.com"}

# Check scan status
{:ok, status} = PrismaticOsint.SpiderFoot.status(scan.id)
# => %{status: "running", progress: 67, modules_completed: 142, modules_total: 212}

# Get results by type
{:ok, emails} = PrismaticOsint.SpiderFoot.results(scan.id, type: :email)
# => [
#   %{data: "admin@example.com", source: "sfp_hunter", confidence: 90},
#   %{data: "john.doe@example.com", source: "sfp_linkedin", confidence: 75}
# ]

# Get all subdomains discovered
{:ok, subdomains} = PrismaticOsint.SpiderFoot.results(scan.id, type: :subdomain)
# => [
#   %{data: "mail.example.com", source: "sfp_securitytrails"},
#   %{data: "vpn.example.com", source: "sfp_crtsh"},
#   %{data: "dev.example.com", source: "sfp_dnsdumpster"}
# ]

# Get vulnerability findings
{:ok, vulns} = PrismaticOsint.SpiderFoot.results(scan.id, type: :vulnerability)

# Export full scan report
{:ok, report} = PrismaticOsint.SpiderFoot.export(scan.id, format: :json)

# Targeted passive-only scan (no active probing)
{:ok, passive_scan} = PrismaticOsint.SpiderFoot.scan("target-person@example.com",
  name: "Person OSINT - Passive Only",
  modules: [:passive_only],
  use_case: :passive
)

# Integrate SpiderFoot results into platform pipeline
{:ok, enriched} = PrismaticOsint.Pipeline.spiderfoot_enrichment("example.com",
  scan_modules: [:dns, :email, :breach, :social],
  cross_reference: [:shodan, :securitytrails, :virustotal]
)
```

## Data Schema

| Field | Type | Description |
|-------|------|-------------|
| `scan_id` | string | Unique scan identifier |
| `scan_name` | string | User-assigned scan name |
| `scan_target` | string | Original scan target |
| `scan_status` | enum | `created`, `running`, `finished`, `aborted`, `error` |
| `scan_started` | datetime | Scan start timestamp |
| `scan_ended` | datetime | Scan completion timestamp |
| `data[].type` | string | SpiderFoot data type (EMAILADDR, DOMAIN, IP_ADDRESS, etc.) |
| `data[].data` | string | Discovered data value |
| `data[].module` | string | Module that discovered this data |
| `data[].source` | string | Source entity that led to this discovery |
| `data[].confidence` | integer | Confidence score (0-100) |
| `data[].risk` | enum | Risk assessment (info, low, medium, high, critical) |
| `data[].last_seen` | datetime | When the data was last observed |

### SpiderFoot Data Types

| Type Code | Description | Example |
|-----------|-------------|---------|
| `DOMAIN_NAME` | Discovered domain | `example.com` |
| `INTERNET_NAME` | Subdomain or hostname | `mail.example.com` |
| `IP_ADDRESS` | IPv4 address | `1.2.3.4` |
| `IPV6_ADDRESS` | IPv6 address | `2001:db8::1` |
| `EMAILADDR` | Email address | `admin@example.com` |
| `PHONE_NUMBER` | Phone number | `+1-555-123-4567` |
| `SOCIAL_MEDIA` | Social media profile | `twitter.com/example` |
| `VULNERABILITY` | CVE or vulnerability | `CVE-2024-12345` |
| `DARKNET_MENTION` | Dark web reference | Mention on .onion site |
| `LEAKSITE_CONTENT` | Breach/leak data | Credentials in dump |
| `SSL_CERTIFICATE` | Certificate details | SHA-256 fingerprint |
| `TCP_PORT_OPEN` | Open port | `443/tcp` |
| `WEB_TECHNOLOGY` | Detected technology | `WordPress 6.4` |
| `ASN` | Autonomous System | `AS13335` |
| `GEOINFO` | Geolocation data | Country, city, coordinates |

## Use Cases

### Automated Reconnaissance

SpiderFoot eliminates the manual process of querying individual OSINT sources. A single scan target triggers comprehensive reconnaissance across all relevant data sources with automatic correlation. This systematic approach ensures complete coverage without relying on an analyst's memory of which sources to check, making it ideal for standardized reconnaissance procedures.

### Attack Surface Discovery

By querying DNS databases, certificate transparency logs, web crawlers, and internet scanners simultaneously, SpiderFoot maps the complete external attack surface of an organization. The recursive discovery process uncovers shadow IT, forgotten infrastructure, and interconnected services that manual investigation might miss.

### Data Breach Assessment

SpiderFoot's integration with breach databases (Have I Been Pwned, Intelligence X, DeHashed) enables rapid assessment of an organization's exposure to credential leaks. By discovering all email addresses associated with a target domain and checking each against breach databases, SpiderFoot quantifies credential exposure across the organization.

### Dark Web Monitoring

SpiderFoot's dark web modules scan .onion services, dark web forums, and paste sites for mentions of target entities. This reveals whether an organization's data, credentials, or internal documents have been posted on dark web marketplaces or forums.

### Person-of-Interest Investigation

When investigating a specific individual, SpiderFoot correlates information across social media platforms, public records, email databases, and breach repositories to build a comprehensive profile. Starting from a name, email, or username, the platform discovers linked accounts, associated organizations, and digital footprints.

### Supply Chain Security Assessment

SpiderFoot enables assessment of third-party vendor security posture by scanning vendor domains, IP ranges, and key personnel. This reveals exposed infrastructure, leaked credentials, dark web mentions, and other risk indicators for supply chain partners.

## Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **API key requirements** | Many premium modules require API keys from third-party services | Pre-configure API keys for all relevant services |
| **Scan duration** | Full-scope scans across 200+ modules can take hours | Use module selection to scope scans appropriately |
| **Rate limiting** | Third-party APIs may rate-limit SpiderFoot queries | Configure per-module rate limits in SpiderFoot settings |
| **False positives** | Automated correlation may link unrelated entities | Review and validate high-impact findings manually |
| **Resource consumption** | Large scans consume significant CPU, memory, and bandwidth | Deploy on dedicated infrastructure with adequate resources |
| **Active scanning risk** | Some modules perform active probing of target infrastructure | Use passive-only mode for unauthorized targets |
| **Data freshness** | Results depend on freshness of underlying data sources | Run scans periodically for current intelligence |

## Legal and Ethical Considerations

**Passive vs. Active Modules**: SpiderFoot modules range from purely passive (querying external databases) to actively scanning target infrastructure. Ensure that active scanning modules are only enabled against authorized targets. SpiderFoot's module documentation clearly marks which modules perform active probing.

**Third-Party API Terms**: SpiderFoot queries third-party APIs on your behalf. Ensure your use of these APIs complies with their individual terms of service, particularly regarding automated queries and data retention.

**Data Handling**: SpiderFoot scans may discover sensitive information including email addresses, breach data, and personal information. Handle discovered data in accordance with applicable privacy regulations (GDPR, CCPA) and organizational data handling policies.

**Authorization**: While passive reconnaissance is generally legal, the comprehensiveness of SpiderFoot scans means they can discover information that the target may not expect to be easily aggregated. Ensure reconnaissance activities are authorized, particularly for engagements involving person-of-interest investigations.

**Dark Web Modules**: Dark web scanning may expose the investigator's infrastructure to monitoring. Use appropriate operational security measures (VPN, Tor, dedicated analysis systems) when enabling dark web modules.

## Integration with Prismatic Platform

Within the [Prismatic Platform](/apps/prismatic/), SpiderFoot serves as the automated reconnaissance engine for comprehensive OSINT collection.

- **Automated Reconnaissance Pipeline**: SpiderFoot scans are triggered through the platform's investigation workflow, with results automatically ingested and correlated with existing entity data.
- **Module Orchestration**: The platform manages SpiderFoot module selection and API key configuration, ensuring optimal module activation for each investigation type.
- **Entity Enrichment**: SpiderFoot discoveries feed into the platform's [knowledge graph](/glossary/knowledge-graph/), automatically enriching entities with cross-source intelligence.
- **Breach Intelligence**: SpiderFoot's breach detection results are correlated with [Have I Been Pwned](/osint/haveibeenpwned/) and [Intelligence X](/osint/intelx/) data for comprehensive credential exposure assessment.
- **Attack Surface Integration**: SpiderFoot's domain and infrastructure discoveries feed into [Prismatic Perimeter](/apps/prismatic-perimeter/) for continuous attack surface monitoring.
- **Report Generation**: SpiderFoot scan results are formatted into the platform's standardized investigation report templates.

## Best Practices

1. **Configure API keys before scanning**: Pre-load all available API keys in SpiderFoot's configuration to maximize module coverage. Missing keys will silently skip those modules.

2. **Use targeted module selection**: Full-scope scans are comprehensive but slow. Select modules relevant to your investigation objective for faster, more focused results.

3. **Start passive, go active**: Begin with passive-only modules to gather intelligence without touching the target, then selectively enable active modules for authorized assessments.

4. **Review correlation chains**: SpiderFoot's automated correlation is powerful but can produce false links. Trace the discovery chain for high-impact findings to validate the correlation logic.

5. **Schedule recurring scans**: For ongoing monitoring, schedule periodic scans to detect changes in an organization's attack surface, new breach exposures, or emerging dark web mentions.

6. **Export and archive results**: Export scan results in JSON format for long-term archival and cross-session analysis.

7. **Use Docker for isolation**: Deploy SpiderFoot in Docker containers to isolate scanning infrastructure and simplify deployment.

8. **Combine with specialized tools**: Use SpiderFoot for broad coverage, then follow up with specialized tools ([Shodan](/osint/shodan/) for deep port analysis, [Maltego](/osint/maltego/) for visual analysis) for detailed investigation.

## Related Providers

- [Maltego](/osint/maltego/) - Visual link analysis and graph intelligence
- [Shodan](/osint/shodan/) - Internet device and service discovery
- [Censys](/osint/censys/) - Internet-wide scanning platform
- [SecurityTrails](/osint/securitytrails/) - DNS and domain intelligence
- [VirusTotal](/osint/virustotal/) - Multi-engine threat analysis
- [Intelligence X](/osint/intelx/) - Dark web and breach intelligence
- [Have I Been Pwned](/osint/haveibeenpwned/) - Breach detection
- [Hunter.io](/osint/hunter-io/) - Email discovery and verification

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)