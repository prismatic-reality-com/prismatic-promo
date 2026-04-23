+++
title = "Shodan"
weight = 1
[extra]
category = "global"
type = "ip"
module = "Shodan"
description = "The search engine for Internet-connected devices"
has_api = true
url = "https://shodan.io"
rate_limit = "1 req/sec (free), 10 req/sec (paid)"
capabilities = ["IP Lookup", "Port Scanning", "Banner Grabbing", "Vulnerability Detection", "SSL Certificate Analysis", "Historical Data"]
keywords = ["Shodan search engine", "internet-connected device scanner", "attack surface discovery", "port scanning intelligence", "banner grabbing service", "IoT device search engine", "infrastructure reconnaissance tool", "Shodan API integration"]
tags = ["osint", "shodan", "scanning", "reconnaissance"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1675
date_created = "2026-02-23"
date_modified = "2026-02-23"
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Shodan - Prismatic Platform"
+++

## Overview

Shodan is the world's first and most widely used search engine for internet-connected devices. Created by John Matherly in 2009, Shodan continuously scans the entire IPv4 address space and increasingly the IPv6 space, indexing the services running on every reachable device -- from web servers and databases to IoT devices, industrial control systems, and network infrastructure. Unlike traditional search engines that crawl web content, Shodan indexes service banners: the metadata that services announce when a connection is established.

For [OSINT](@/glossary/osint.md) investigators and security professionals, Shodan is indispensable for [attack surface](@/glossary/attack-surface.md) discovery, vulnerability assessment, and infrastructure intelligence. It reveals not just which devices are connected to the internet, but what software they run, what ports they expose, whether they have known vulnerabilities, and how their configurations have changed over time. A single Shodan query can reveal exposed databases, misconfigured cloud services, unpatched industrial control systems, and forgotten development servers that represent significant security risks.

Shodan's scanning infrastructure consists of distributed scanners that probe every public IPv4 address on hundreds of ports, performing protocol-specific handshakes to identify the running service and extract its banner. This banner data includes software versions, configuration details, SSL certificate information, and sometimes even default credentials or error messages that reveal internal system details. The resulting database contains billions of data points about the internet's infrastructure, updated continuously as Shodan's scanners complete their cycles.

The platform has become a standard tool in the security industry, used by penetration testers for reconnaissance, SOC analysts for exposure monitoring, researchers for internet-wide studies, and organizations for their own attack surface management. Shodan's search syntax enables precise filtering across dozens of properties including port, protocol, country, organization, operating system, and specific banner content.

## Data Sources and Coverage

Shodan's scanners operate continuously, probing the entire IPv4 address space on commonly used ports and performing service identification.

| Data Type | Description | Update Frequency |
|-----------|-------------|-----------------|
| **Open Ports** | All detected open ports and services | Continuous scanning |
| **Service Banners** | Protocol-specific banner data with version information | Per-scan cycle |
| **SSL/[TLS](@/glossary/tls.md) Certificates** | Full certificate details, chain analysis, and security assessment | Continuous |
| **Vulnerabilities** | Known CVEs affecting the detected software version | Matched against NVD |
| **Geolocation** | Country, city, latitude/longitude, ISP, ASN | Per IP update |
| **Operating System** | OS fingerprinting from banner and behavior analysis | Per-scan detection |
| **Hostnames** | Reverse DNS and certificate-based hostname discovery | Per-scan cycle |
| **Screenshots** | Visual captures of RDP, VNC, HTTP, and other visual services | When available |
| **Tags** | Automated classification (cloud, IoT, VPN, honeypot, etc.) | Computed per scan |
| **Historical Data** | Complete change history for each IP address | Retained indefinitely (paid) |

### Commonly Scanned Ports

| Port Range | Services | Intelligence Value |
|-----------|---------|-------------------|
| 21, 22, 23 | FTP, SSH, Telnet | Remote access exposure, credential risks |
| 25, 110, 143, 587 | SMTP, POP3, IMAP | Email infrastructure mapping |
| 80, 443, 8080, 8443 | HTTP/HTTPS | Web application discovery |
| 1433, 3306, 5432, 27017 | MSSQL, MySQL, PostgreSQL, MongoDB | Database exposure |
| 502, 47808, 20000 | Modbus, BACnet, DNP3 | Industrial control systems (ICS/SCADA) |
| 1883, 5683, 8883 | MQTT, CoAP | IoT protocol exposure |
| 3389, 5900 | RDP, VNC | Remote desktop exposure |
| 6379, 9200, 11211 | Redis, Elasticsearch, Memcached | Cache and search exposure |
| 9100, 515 | Printer (JetDirect, LPD) | Printer and peripheral exposure |

## API Integration

Shodan provides a comprehensive REST API at `https://api.shodan.io/` with JSON responses. Authentication uses an API key passed as a query parameter.

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/shodan/host/{ip}` | GET | Get all information about a specific IP |
| `/shodan/host/count` | GET | Count results for a search query |
| `/shodan/host/search` | GET | Search Shodan with filters |
| `/shodan/host/search/facets` | GET | List available search facets |
| `/shodan/host/search/filters` | GET | List available search filters |
| `/shodan/host/search/tokens` | GET | Parse a search query into tokens |
| `/dns/domain/{domain}` | GET | DNS entries for a domain |
| `/dns/resolve` | GET | Resolve hostnames to IPs |
| `/dns/reverse` | GET | Reverse DNS lookup |
| `/shodan/scan` | POST | Request on-demand scan of IPs |
| `/shodan/alert` | POST | Create monitoring alert |
| `/shodan/alert/{id}/info` | GET | Get alert details |

### Rate Limits by Plan

| Plan | Queries/Month | Scan Credits | Features | Price |
|------|---------------|-------------|----------|-------|
| **Free** | 100 | 0 | Basic lookups, single IP | $0 |
| **Membership** | 10,000 | 100 | Filters, exports, vulnerability info | $49 (one-time) |
| **Freelancer** | 10,000 | 5,120 | On-demand scanning, monitoring | $69/mo |
| **Small Business** | 100,000 | 65,536 | Full API, network monitoring | $359/mo |
| **Enterprise** | Unlimited | Unlimited | Dedicated support, custom integrations | Custom |

## Query Examples

### curl Examples

```bash
# Get host information for a specific IP
curl "https://api.shodan.io/shodan/host/1.2.3.4?key=YOUR_KEY"

# Search for all hosts in an organization
curl "https://api.shodan.io/shodan/host/search?key=YOUR_KEY&query=org:%22Example+Corp%22"

# Search for exposed MongoDB databases
curl "https://api.shodan.io/shodan/host/search?key=YOUR_KEY&query=product:mongodb+port:27017"

# Search for Elasticsearch clusters
curl "https://api.shodan.io/shodan/host/search?key=YOUR_KEY&query=port:9200+%22elastic%22"

# Find exposed webcams with screenshots
curl "https://api.shodan.io/shodan/host/search?key=YOUR_KEY&query=webcam+has_screenshot:true"

# Search for ICS/SCADA systems
curl "https://api.shodan.io/shodan/host/search?key=YOUR_KEY&query=port:502+%22schneider%22"

# Get DNS entries for a domain
curl "https://api.shodan.io/dns/domain/example.com?key=YOUR_KEY"

# Resolve hostnames
curl "https://api.shodan.io/dns/resolve?hostnames=example.com,google.com&key=YOUR_KEY"

# Get honeypot probability score
curl "https://api.shodan.io/labs/honeyscore/1.2.3.4?key=YOUR_KEY"

# Request on-demand scan
curl -X POST "https://api.shodan.io/shodan/scan?key=YOUR_KEY" \
  -d "ips=1.2.3.4"

# Create a monitoring alert
curl -X POST "https://api.shodan.io/shodan/alert?key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Network", "filters": {"ip": ["1.2.3.0/24"]}, "expires": 0}'
```

### Shodan Search Syntax

```bash
# Organization search
org:"Example Corp"

# Product and version search
product:"Apache" version:"2.4.49"

# Geographic filtering
country:"CZ" city:"Prague"

# ASN-based search
asn:"AS13335"

# Port-specific search
port:3389 os:"Windows"

# SSL certificate search
ssl.cert.subject.cn:"example.com"

# Vulnerability search
vuln:"CVE-2021-44228"

# Has screenshot
has_screenshot:true http.title:"Dashboard"

# Combined filters for exposed databases
product:mongodb port:27017 -authentication

# Industrial control systems in a country
port:502 country:"DE"

# Expired SSL certificates
ssl.cert.expired:true org:"Target Corp"

# HTTP title search
http.title:"Index of /"

# Technology-specific search
http.component:"WordPress" http.component_category:"CMS"
```

### Elixir Integration

```elixir
# Search for hosts in an organization
{:ok, results} = PrismaticOsint.Shodan.search("org:\"Example Corp\"",
  page: 1
)
# => %{
#   total: 1247,
#   matches: [
#     %{ip_str: "1.2.3.4", port: 443, transport: "tcp",
#       product: "nginx", version: "1.25.3",
#       org: "Example Corp", os: "Linux",
#       vulns: ["CVE-2024-12345"],
#       ssl: %{cert: %{subject: %{CN: "www.example.com"}}},
#       location: %{country_code: "US", city: "San Francisco"}}
#   ]
# }

# Get detailed information for a specific IP
{:ok, host} = PrismaticOsint.Shodan.host("1.2.3.4")
# => %{
#   ip_str: "1.2.3.4",
#   ports: [22, 80, 443, 8080],
#   hostnames: ["www.example.com"],
#   org: "Example Corp",
#   os: "Linux",
#   vulns: ["CVE-2024-12345", "CVE-2024-67890"],
#   data: [
#     %{port: 443, transport: "tcp", product: "nginx",
#       ssl: %{cert: %{...}}, http: %{title: "Example Site"}}
#   ]
# }

# DNS resolution
{:ok, dns} = PrismaticOsint.Shodan.dns_resolve(["example.com", "test.example.com"])
# => %{"example.com" => "1.2.3.4", "test.example.com" => "1.2.3.5"}

# Get honeypot probability score
{:ok, score} = PrismaticOsint.Shodan.honeyscore("1.2.3.4")
# => 0.15  # Low probability of honeypot

# Create monitoring alert for network range
{:ok, alert} = PrismaticOsint.Shodan.create_alert("Production Network",
  ip: ["1.2.3.0/24", "5.6.7.0/24"]
)

# Scan a specific IP on demand
{:ok, scan} = PrismaticOsint.Shodan.scan(["1.2.3.4", "1.2.3.5"])

# Full attack surface assessment pipeline
{:ok, surface} = PrismaticOsint.Pipeline.assess_attack_surface("example.com",
  sources: [:shodan, :censys, :securitytrails, :crtsh],
  include_vulnerabilities: true,
  include_screenshots: true
)
```

## Data Schema

| Field | Type | Description |
|-------|------|-------------|
| `ip_str` | string | IP address as string |
| `ip` | integer | IP address as integer |
| `port` | integer | Port number |
| `transport` | string | Transport protocol (tcp, udp) |
| `product` | string | Identified software product |
| `version` | string | Software version |
| `data` | string | Raw banner data |
| `org` | string | Organization owning the IP |
| `isp` | string | Internet Service Provider |
| `os` | string | Operating system |
| `asn` | string | Autonomous System Number |
| `hostnames` | array | Associated hostnames |
| `domains` | array | Associated domains |
| `location.country_code` | string | ISO country code |
| `location.city` | string | City name |
| `location.latitude` | float | Geographic latitude |
| `location.longitude` | float | Geographic longitude |
| `vulns` | array | CVE identifiers for known vulnerabilities |
| `tags` | array | Automated classification tags |
| `ssl.cert.subject.CN` | string | SSL certificate common name |
| `ssl.cert.issuer.O` | string | Certificate issuer organization |
| `ssl.cert.expired` | boolean | Whether certificate has expired |
| `ssl.cert.fingerprint.sha256` | string | Certificate SHA-256 fingerprint |
| `http.title` | string | HTTP page title |
| `http.server` | string | HTTP server header |
| `http.status` | integer | HTTP response status code |
| `http.html` | string | HTTP response body (truncated) |
| `screenshot.data` | string | Base64-encoded screenshot (when available) |

## Use Cases

### Attack Surface Discovery

Shodan is the primary tool for discovering an organization's internet-exposed assets. By searching for an organization's name, ASN, or IP ranges, analysts identify all publicly reachable services. This reveals not only intended public-facing services but also forgotten development servers, misconfigured databases, exposed admin panels, and shadow IT that bypassed security controls.

### Vulnerability Assessment

Shodan matches detected software versions against the NVD vulnerability database, automatically flagging hosts running software with known CVEs. This enables rapid identification of vulnerable internet-facing assets without active scanning. The `vuln` filter allows direct searches for hosts affected by specific CVEs, such as Log4Shell (CVE-2021-44228) or ProxyShell.

### Industrial Control System (ICS) Security

Shodan provides unique visibility into exposed industrial control systems including Modbus, BACnet, DNP3, and other ICS protocols. This capability is critical for identifying SCADA systems that should never be directly accessible from the internet, supporting both security assessments and critical infrastructure protection research.

### Competitive Intelligence

By analyzing the technology stack of competitor organizations through Shodan, analysts identify their hosting providers, web servers, CMS platforms, cloud services, and infrastructure scale. This intelligence supports business development, market analysis, and technology strategy planning.

### Internet-of-Things (IoT) Security Research

Shodan indexes millions of IoT devices including webcams, smart home devices, printers, and industrial sensors. Researchers use Shodan to study the security posture of IoT deployments at scale, identify default credentials, and track the adoption of security patches across device populations.

### Honeypot Detection

Shodan's honeypot scoring API uses behavioral analysis to estimate whether a system is a honeypot designed to attract attackers. This is valuable for both red teams (avoiding decoys during testing) and researchers (identifying research infrastructure).

## Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Scan cycle timing** | Not real-time; scan cycles take days to weeks | Use on-demand scanning for time-sensitive needs |
| **IPv6 coverage** | Limited IPv6 scanning compared to IPv4 | Supplement with [Censys](@/osint/censys.md) for IPv6 coverage |
| **Free tier limits** | 100 queries/month and no filters severely limits utility | Membership ($49 one-time) provides significant upgrade |
| **Banner depth** | Service identification depends on banner quality | Some services may be misidentified or unidentified |
| **Firewall evasion** | Cannot detect services behind firewalls or WAFs | Combine with authorized internal scanning |
| **False positive CVEs** | Vulnerability matching based on version strings may be inaccurate | Verify vulnerabilities with active scanning tools |
| **No application-layer testing** | Identifies software but does not test for application-level bugs | Supplement with [Nuclei](@/osint/nuclei.md) for application testing |

## Legal and Ethical Considerations

**Passive Reconnaissance**: Querying Shodan's existing database is considered passive reconnaissance and does not constitute unauthorized access. Shodan has already scanned the targets; analysts are querying a database, not the target systems.

**On-Demand Scanning**: Shodan's on-demand scan feature initiates active scanning of specified IPs. This should only be used against assets you are authorized to scan, as active scanning without permission may violate computer access laws.

**Responsible Use**: While Shodan reveals exposed and vulnerable systems, using this information to access, exploit, or damage those systems without authorization is illegal. Shodan's purpose is defensive security research and authorized testing.

**Exposed Data**: Shodan may reveal sensitive information in banners (database contents, default credentials, internal configurations). Accessing systems using discovered credentials without authorization is illegal regardless of how easy Shodan makes discovery.

## Integration with Prismatic Platform

Within the [Prismatic Platform](@/apps/prismatic.md), Shodan serves as the primary internet scanning intelligence source for infrastructure discovery and vulnerability assessment.

- **Perimeter EASM**: Shodan data feeds [Prismatic Perimeter](@/apps/prismatic-perimeter.md) with service-level intelligence for all discovered IP addresses, complementing DNS-level discovery from [SecurityTrails](@/osint/securitytrails.md).
- **Vulnerability Dashboard**: Shodan CVE data is correlated with [NVD](@/osint/nvd.md) and [OSV.dev](@/osint/osv-dev.md) to build comprehensive vulnerability profiles for monitored infrastructure.
- **Security Ratings**: Service exposure data from Shodan contributes to the platform's A-F security rating calculations for assessed organizations.
- **Infrastructure Graphing**: Shodan host data feeds the platform's [knowledge graph](@/glossary/knowledge-graph.md), mapping relationships between IPs, services, certificates, and organizations.
- **Alert Monitoring**: Shodan monitoring alerts are integrated into the Perimeter dashboard for real-time notification of infrastructure changes.
- **Cross-Scanner Validation**: Shodan findings are correlated with [Censys](@/osint/censys.md), [ZoomEye](@/osint/zoomeye.md), and [BinaryEdge](@/osint/binaryedge.md) for multi-source infrastructure intelligence.

## Best Practices

1. **Use organization filters**: `org:"Company Name"` provides the most reliable way to find an organization's internet-facing assets, more accurate than IP range searches.

2. **Check for exposed databases first**: Searches for `product:mongodb`, `product:elasticsearch`, `product:redis` with authentication-related negative filters quickly reveal critical exposures.

3. **Monitor with alerts**: Set up Shodan alerts for your organization's IP ranges to receive notifications when new services appear or configurations change.

4. **Use facets for analysis**: Shodan's facet system enables statistical analysis of search results by port, product, country, and other dimensions.

5. **Verify with on-demand scans**: Shodan's database may be days or weeks old. Use on-demand scanning (with authorization) to verify current state before reporting findings.

6. **Check the honeypot score**: Before spending time investigating a suspicious host, check its honeypot probability to avoid wasting effort on decoys.

7. **Combine with DNS intelligence**: Use [SecurityTrails](@/osint/securitytrails.md) to discover domains and subdomains, then feed resolved IPs into Shodan for service-level intelligence.

8. **Track historical changes**: Shodan's historical data (paid feature) reveals how a host's services and configurations have changed over time, which is invaluable for incident investigation.

## Related Providers

- [Censys](@/osint/censys.md) - Internet-wide scanning with certificate intelligence
- [ZoomEye](@/osint/zoomeye.md) - Chinese internet scanning with Asia-Pacific coverage
- [BinaryEdge](@/osint/binaryedge.md) - Internet scanning with data leak detection
- [GreyNoise](@/osint/greynoise.md) - Distinguish scanners from targeted attacks
- [ONYPHE](@/osint/onyphe.md) - French cyber defense with European focus
- [Netlas](@/osint/netlas.md) - Internet intelligence with response-level search
- [SecurityTrails](@/osint/securitytrails.md) - DNS intelligence to feed IP discovery
- [Nuclei](@/osint/nuclei.md) - Template-based vulnerability validation for Shodan findings

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)