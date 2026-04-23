+++
title = "ONYPHE"
weight = 52
[extra]
category = "global"
type = "ip"
module = "Onyphe"
description = "French cyber defense search engine for internet-connected assets"
has_api = true
url = "https://onyphe.io"
rate_limit = "API key required, tiered plans"
capabilities = ["IP Intelligence", "Domain Discovery", "Vulnerability Detection", "Geolocation", "Threat Detection", "Passive DNS"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1335
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ONYPHE", "French", "osint", "global", "Prismatic Platform", "European"]
tags = ["osint", "global", "onyphe", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "ONYPHE - Prismatic Platform"
+++

## Overview

ONYPHE is a French cyber defense search engine that collects and indexes data from the internet by scanning IP addresses, crawling URLs, and aggregating [threat intelligence](@/glossary/threat-intelligence.md) feeds. It provides a comprehensive view of the [attack surface](@/glossary/attack-surface.md) through active scanning, passive DNS collection, certificate monitoring, and threat feed integration. ONYPHE differentiates itself with strong [GDPR](@/glossary/gdpr.md) compliance and European data sovereignty.

Founded in 2017 by Patrice Auffret, ONYPHE is built on the principle that European organizations need internet intelligence platforms that comply with EU data protection regulations without sacrificing capability. All data is stored and processed within the European Union, making ONYPHE the preferred choice for organizations subject to European data sovereignty requirements, particularly those in regulated sectors like finance, healthcare, and government.

ONYPHE's data collection methodology combines active scanning (port scanning, service fingerprinting, vulnerability detection), passive collection (DNS resolution monitoring, certificate transparency log analysis), and threat intelligence aggregation (blocklists, botnet command-and-control tracking, scanner identification). This multi-source approach provides a more complete picture than any single collection method could achieve.

The platform's query language supports complex searches across multiple data categories, enabling analysts to perform sophisticated correlation queries that combine infrastructure data, vulnerability information, and threat intelligence in a single query. This integrated approach reduces the need to cross-reference multiple tools for common analysis tasks.

## Data Sources and Coverage

| Data Category | Description | Collection Method | Volume |
|--------------|-------------|-------------------|--------|
| **IP Scanning (SynScan)** | Open ports, services, banners, OS detection | Active SYN scanning | Full IPv4 weekly |
| **Data Scanning** | Service-specific data collection (HTTP, SSH, etc.) | Active protocol interaction | Top 100 ports |
| **Passive DNS** | Historical DNS resolution data | Sensor network monitoring | Billions of records |
| **DNS Resolution** | Active DNS queries for domains | Active DNS resolution | 500M+ domains |
| **Certificate Monitoring** | SSL/[TLS](@/glossary/tls.md) certificate tracking | CT log + active collection | All publicly trusted CAs |
| **Geolocation** | IP to geographic location mapping | Multi-source aggregation | Full IPv4 coverage |
| **Threat Lists** | Blocklists, botnet, C2, scanner identification | Feed aggregation | 100+ feeds |
| **Data Leak Detection** | Exposed databases and sensitive data | Active scanning + monitoring | Continuous |
| **[CVE](@/glossary/cve.md) Mapping** | Vulnerability detection via version matching | Automated CVE correlation | 200K+ CVEs |
| **Web Crawling** | HTTP response headers, technologies, content | Active HTTP crawling | 100M+ URLs |
| **WHOIS** | Domain registration data | WHOIS queries | 500M+ domains |

### ONYPHE Data Categories

| Category | API Name | Description |
|----------|----------|-------------|
| `synscan` | IP scanning results | Port states from SYN scans |
| `datascan` | Service data | Protocol-specific banner and response data |
| `resolver` | DNS resolution | Active DNS query results |
| `pastries` | Paste sites | Content from paste services mentioning targets |
| `sniffer` | Passive DNS | DNS traffic observation data |
| `ctl` | Certificate transparency | CT log entries |
| `geoloc` | Geolocation | Geographic location for IPs |
| `inetnum` | IP allocation | RIR allocation records |
| `threatlist` | Threat intelligence | Blocklist and threat feed matches |
| `topsite` | Website ranking | Popularity ranking data |
| `vulnscan` | Vulnerability scanning | CVE detection results |
| `whois` | WHOIS data | Domain registration information |

## API Integration

ONYPHE provides a REST API at `https://www.onyphe.io/api/v2/` with JSON responses. Authentication uses API key passed as a query parameter or in the `Authorization` header.

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v2/simple/{category}/{value}` | GET | Simple lookup by category |
| `/api/v2/search/{category}` | GET | Advanced search with OQL |
| `/api/v2/summary/ip/{ip}` | GET | Full IP summary |
| `/api/v2/summary/domain/{domain}` | GET | Full domain summary |
| `/api/v2/summary/hostname/{hostname}` | GET | Hostname summary |
| `/api/v2/export/{category}` | GET | Bulk export (Enterprise) |
| `/api/v2/alert/list` | GET | List active alerts |
| `/api/v2/alert/add` | POST | Create monitoring alert |

### Rate Limits and Plans

| Plan | Queries/Month | Results/Query | Categories | Price |
|------|-------------|--------------|------------|-------|
| Free | 50 | 10 | Limited | Free |
| Professional | 10,000 | 100 | All | EUR 99/mo |
| Business | 50,000 | 1,000 | All + Export | EUR 499/mo |
| Enterprise | Unlimited | 10,000 | All + Bulk | Custom |

## Query Examples

### ONYPHE Query Language (OQL)

```
# Search by IP address
ip:1.2.3.4

# Search by domain
domain:example.com

# Search by ASN
asnum:47232

# Search by country
country:CZ

# Find vulnerable Apache servers in Czech Republic
category:vulnscan AND product:Apache AND country:CZ

# Find exposed MongoDB databases
category:datascan AND port:27017 AND product:MongoDB

# Search for specific CVE
category:vulnscan AND cve:CVE-2024-3400

# Find assets by organization name
organization:"Example Corp"

# Combine conditions: critical vulns on Czech IPs
category:vulnscan AND country:CZ AND cvss:[9 TO 10]

# Passive DNS: domains resolving to an IP
category:resolver AND ip:1.2.3.4

# Threat intelligence: IP on blocklists
category:threatlist AND ip:1.2.3.4

# Certificate search
category:ctl AND domain:example.com

# Data leak detection: exposed databases
category:datascan AND tag:database AND tag:exposed
```

### curl Examples

```bash
# IP summary - complete intelligence on an IP
curl "https://www.onyphe.io/api/v2/summary/ip/1.2.3.4?apikey=YOUR_KEY"

# Domain summary
curl "https://www.onyphe.io/api/v2/summary/domain/example.com?apikey=YOUR_KEY"

# Search for vulnerable services
curl "https://www.onyphe.io/api/v2/search/vulnscan?q=domain:example.com%20AND%20cvss:%5B7%20TO%2010%5D&apikey=YOUR_KEY"

# Passive DNS lookup
curl "https://www.onyphe.io/api/v2/simple/resolver/example.com?apikey=YOUR_KEY"

# Threat intelligence check
curl "https://www.onyphe.io/api/v2/simple/threatlist/1.2.3.4?apikey=YOUR_KEY"

# Certificate transparency search
curl "https://www.onyphe.io/api/v2/search/ctl?q=domain:example.com&apikey=YOUR_KEY"

# Create monitoring alert
curl -X POST "https://www.onyphe.io/api/v2/alert/add?apikey=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "New vulns on example.com", "query": "category:vulnscan AND domain:example.com AND cvss:[7 TO 10]"}'
```

### Elixir Integration

```elixir
# Full IP intelligence lookup
{:ok, intel} = PrismaticOsint.Onyphe.ip_summary("1.2.3.4")
# => %{
#   ip: "1.2.3.4",
#   country: "CZ", city: "Prague",
#   asn: 47232, organization: "Example ISP",
#   ports: [22, 80, 443, 8080],
#   services: [
#     %{port: 443, protocol: "https", product: "nginx", version: "1.24.0"},
#     %{port: 22, protocol: "ssh", product: "OpenSSH", version: "9.6"}
#   ],
#   vulnerabilities: [%{cve: "CVE-2024-1234", cvss: 7.5}],
#   threat_lists: [],
#   certificates: [%{subject: "*.example.com", issuer: "Let's Encrypt"}]
# }

# Domain intelligence
{:ok, domain_intel} = PrismaticOsint.Onyphe.domain_summary("example.com")
# => %{subdomains: ["www", "mail", "api"], ips: ["1.2.3.4", "5.6.7.8"],
#       technologies: ["nginx", "React"], certificates: [...]}

# Vulnerability search
{:ok, vulns} = PrismaticOsint.Onyphe.vulnscan("example.com",
  cvss_min: 7.0
)
# => [%{ip: "1.2.3.4", port: 443, cve: "CVE-2024-1234", cvss: 7.5}]

# Passive DNS lookup
{:ok, dns} = PrismaticOsint.Onyphe.passive_dns("example.com")
# => [%{domain: "example.com", ip: "1.2.3.4", first_seen: ~U[...], last_seen: ~U[...]}]

# Threat intelligence check
{:ok, threats} = PrismaticOsint.Onyphe.threat_check("1.2.3.4")
# => %{is_listed: false, lists_checked: 100, matches: []}

# Create monitoring alert for new vulnerabilities
{:ok, alert} = PrismaticOsint.Onyphe.create_alert(
  "Vulns on example.com",
  "category:vulnscan AND domain:example.com AND cvss:[7 TO 10]",
  notify: :webhook
)
```

## Data Schema

| Field | Type | Description |
|-------|------|-------------|
| `ip` | string | IP address |
| `port` | integer | Service port number |
| `protocol` | string | Network protocol |
| `transport` | string | Transport protocol (tcp/udp) |
| `product` | string | Detected software product |
| `version` | string | Software version string |
| `os` | string | Detected operating system |
| `asn` | integer | Autonomous System Number |
| `organization` | string | Organization owning the IP block |
| `country` | string | ISO country code |
| `city` | string | City name |
| `latitude` | float | Geographic latitude |
| `longitude` | float | Geographic longitude |
| `cve` | array | Associated CVE identifiers |
| `cvss` | float | Highest CVSS score |
| `domain` | string | Associated domain name |
| `hostname` | string | Resolved hostname |
| `tls.subject` | string | TLS certificate subject |
| `tls.issuer` | string | TLS certificate issuer |
| `tls.validity` | object | Certificate validity dates |
| `threatlist` | array | Matched threat intelligence lists |
| `tag` | array | Classification tags |
| `forward` | string | Forward DNS resolution |
| `reverse` | string | Reverse DNS resolution |

## Use Cases

### Attack Surface Monitoring

ONYPHE provides continuous monitoring of external assets with European data residency. Organizations configure alerts for new services, vulnerabilities, or threat intelligence matches affecting their IP ranges and domains. The GDPR-compliant data processing makes ONYPHE suitable for European regulated sectors.

### Threat Intelligence

ONYPHE aggregates threat intelligence from over 100 feeds, providing IP reputation assessment that combines blocklist matches, botnet detection, scanner identification, and historical behavior analysis. The integrated approach eliminates the need to query multiple threat feeds separately.

### [NIS2](@/glossary/nis2.md) Compliance

European organizations subject to the NIS2 Directive can use ONYPHE to assess their attack surface, monitor for vulnerabilities, and demonstrate continuous security monitoring as required by the directive. ONYPHE's EU data sovereignty aligns with NIS2's emphasis on European cybersecurity autonomy.

### Vulnerability Management

ONYPHE's vulnscan category provides passive vulnerability assessment by mapping detected service versions to known CVEs. This enables organizations to identify vulnerable services across their internet-facing estate without sending scanning traffic that might trigger security alerts.

### Incident Response

During incident response, ONYPHE provides rapid context for observed IP addresses, domains, and indicators. The summary endpoints consolidate all available intelligence about an entity into a single response, accelerating triage and investigation.

## Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **European focus** | Stronger coverage of EU infrastructure vs global | Supplement with [Shodan](@/osint/shodan.md)/[Censys](@/osint/censys.md) for global coverage |
| **Free tier limited** | 50 queries/month with 10 results | Professional tier for regular use |
| **Scan frequency** | Full IPv4 scan takes ~1 week | Use alerts for near-real-time notifications |
| **No IPv6 scanning** | IPv6 address space not scanned | Use other tools for IPv6 assessment |
| **Query complexity** | OQL learning curve for advanced queries | Start with simple lookups, build complexity |

## Legal and Ethical Considerations

**GDPR Compliance**: ONYPHE stores and processes all data within the European Union, complying with GDPR data residency requirements. Personal data handling follows EU data protection regulations with appropriate technical and organizational measures.

**European Data Sovereignty**: For organizations subject to European data sovereignty regulations, ONYPHE provides an alternative to US-based scanning platforms that may be subject to US government data access under CLOUD Act or FISA.

**Passive Intelligence**: Using ONYPHE to query indexed scan results is passive reconnaissance that generates no traffic to targets. This is legally equivalent to querying a search engine.

**Vulnerability Disclosure**: If ONYPHE searches reveal critical vulnerabilities in third-party infrastructure, consider responsible disclosure, particularly for critical infrastructure operators.

## Integration with Prismatic Platform

Within the [Prismatic Platform](@/apps/prismatic.md), ONYPHE serves as the European-sovereign internet intelligence source, complementing global scanning platforms.

- **EU Data Sovereignty**: For European clients, ONYPHE provides attack surface intelligence without US jurisdiction data exposure, critical for [NIS2](@/glossary/nis2.md) and GDPR compliance.
- **Vulnerability Correlation**: ONYPHE vulnscan results are cross-referenced with [Nuclei](@/osint/nuclei.md) active scanning and [NVD](@/osint/nvd.md) intelligence for multi-source vulnerability validation.
- **Threat Intelligence Fusion**: ONYPHE's aggregated threat lists supplement [Pulsedive](@/osint/pulsedive.md), [ThreatFox](@/osint/threatfox.md), and [MISP](@/osint/misp.md) data in the platform's threat intelligence pipeline.
- **Attack Surface Management**: ONYPHE powers the European component of [Prismatic Perimeter](@/apps/prismatic-perimeter.md) EASM, providing asset discovery and monitoring with EU data residency guarantees.
- **Passive DNS Integration**: ONYPHE's passive DNS data feeds into the platform's infrastructure mapping alongside [SecurityTrails](@/osint/securitytrails.md) and [PassiveDNS](@/osint/passivedns.md) sources.

## Best Practices

1. **Use summary endpoints**: The summary endpoints (`/summary/ip/`, `/summary/domain/`) consolidate all available intelligence in a single query, maximizing information per API call.

2. **Learn OQL**: The ONYPHE Query Language enables sophisticated correlation queries. Invest time in learning it to extract maximum value from the platform.

3. **Set up alerts**: Configure alerts for your IP ranges and domains to receive notifications when new vulnerabilities or threat matches are detected.

4. **Leverage EU sovereignty**: For European clients, use ONYPHE as the primary internet intelligence source to maintain data sovereignty compliance.

5. **Combine with active scanning**: Use ONYPHE for passive intelligence and [Nuclei](@/osint/nuclei.md) for active verification of critical findings.

6. **Filter by CVSS**: When searching for vulnerabilities, use CVSS score filtering to focus on actionable findings above your risk threshold.

7. **Cross-reference threat lists**: Validate ONYPHE threat list matches against [AbuseIPDB](@/osint/abuseipdb.md) and [GreyNoise](@/osint/greynoise.md) for confirmation.

## Related Providers

- [Shodan](@/osint/shodan.md) - Global internet scanning platform
- [Censys](@/osint/censys.md) - Internet-wide asset discovery
- [BinaryEdge](@/osint/binaryedge.md) - Threat intelligence platform
- [GreyNoise](@/osint/greynoise.md) - Scanner and noise identification
- [FullHunt](@/osint/fullhunt.md) - Attack surface intelligence
- [Netlas](@/osint/netlas.md) - Response-level internet search
- [MaxMind](@/osint/maxmind.md) - IP geolocation and ASN data

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)