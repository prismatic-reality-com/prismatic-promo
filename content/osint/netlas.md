+++
title = "Netlas.io"
weight = 57
[extra]
category = "global"
type = "attack_surface"
module = "Netlas"
description = "Internet intelligence search engine with response and certificate search"
has_api = true
url = "https://netlas.io"
rate_limit = "50 req/month (free), tiered plans"
capabilities = ["Response Search", "DNS Search", "Certificate Search", "WHOIS Search", "Domain Search", "Vulnerability Detection"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1146
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Netlasio", "Internet", "osint", "global", "Prismatic Platform", "Netlas", "HTTP"]
tags = ["osint", "global", "netlasio", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Netlas.io - Prismatic Platform"
+++

## Overview

Netlas.io is an internet intelligence search engine that indexes HTTP responses, DNS records, SSL certificates, [WHOIS](/glossary/whois/) data, and domain information. Unlike traditional IP scanners, Netlas focuses on response content, enabling searches within HTTP response bodies, headers, and web application content. This makes it particularly effective for finding specific web applications, exposed admin panels, and misconfigured services.

What distinguishes Netlas from other internet scanning platforms like [Shodan](/osint/shodan/) or [Censys](/osint/censys/) is its emphasis on response-level search. While most scanning platforms index services by port, protocol, and banner, Netlas indexes the full HTTP response content -- including HTML bodies, HTTP headers, and server configurations. This enables queries like "find all servers returning a specific error message" or "find all instances of a particular web application framework" that would be impossible with banner-only search engines.

Founded in 2021, Netlas has rapidly grown its index to cover hundreds of millions of internet-facing services across the IPv4 address space. The platform provides five distinct search indices (responses, DNS, certificates, WHOIS, and domains), each offering specialized query syntax and filtering capabilities. For [OSINT](/glossary/osint/) analysts and security researchers, this multi-index approach enables comprehensive attack surface analysis from a single platform.

Netlas also provides vulnerability detection capabilities, mapping discovered services to known CVEs based on detected software versions and configurations. This combines the discovery capabilities of an internet scanner with the assessment capabilities of a vulnerability scanner, reducing the gap between reconnaissance and risk assessment.

## Data Sources and Coverage

| Data Index | Description | Volume | Update Frequency |
|-----------|-------------|--------|-----------------|
| **HTTP Responses** | Full HTTP response headers and bodies from web servers | 400M+ responses | Continuous scanning |
| **DNS Records** | All DNS record types (A, AAAA, MX, NS, SOA, TXT, CNAME, SRV) | 1B+ records | Daily updates |
| **SSL/TLS Certificates** | Certificate details, chain validation, SAN entries | 500M+ certificates | Continuous monitoring |
| **WHOIS Data** | Domain registration information and history | 500M+ domains | Daily updates |
| **Domain Intelligence** | Subdomain enumeration, technology detection, hosting data | 300M+ domains | Weekly scans |
| **Vulnerability Mapping** | CVE matching based on detected software versions | 200K+ CVEs tracked | Real-time matching |

## API Integration

Netlas provides a well-documented REST API at `https://app.netlas.io/api/` with JSON responses. Authentication uses API key passed in the `X-API-Key` header.

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/responses/` | GET | Search HTTP response index |
| `/api/dns/` | GET | Search DNS record index |
| `/api/certs/` | GET | Search certificate index |
| `/api/whois_domains/` | GET | Search WHOIS domain index |
| `/api/whois_ip/` | GET | Search WHOIS IP index |
| `/api/domains/` | GET | Search domain intelligence index |
| `/api/host/{ip}` | GET | Get full host profile |
| `/api/count/` | GET | Count results for a query |
| `/api/stats/` | GET | Get statistical aggregation |
| `/api/download/` | GET | Download results in bulk |

### Rate Limits

| Plan | Queries/Month | Results/Query | Bulk Downloads | Price |
|------|-------------|--------------|----------------|-------|
| Free | 50 | 20 | No | $0 |
| Basic | 5,000 | 100 | Yes | $50/mo |
| Professional | 50,000 | 1,000 | Yes | $200/mo |
| Enterprise | Unlimited | 10,000 | Yes | Custom |

## Query Examples

### curl Examples

```bash
# Search HTTP responses for a specific title
curl "https://app.netlas.io/api/responses/?q=http.title:%22Admin%20Panel%22&start=0&indices=" \
  -H "X-API-Key: YOUR_KEY"

# Search for exposed Elasticsearch instances
curl "https://app.netlas.io/api/responses/?q=http.body:%22cluster_name%22%20AND%20port:9200" \
  -H "X-API-Key: YOUR_KEY"

# DNS search for a domain
curl "https://app.netlas.io/api/dns/?q=domain:example.com" \
  -H "X-API-Key: YOUR_KEY"

# Certificate search by organization
curl "https://app.netlas.io/api/certs/?q=certificate.subject.organization:%22Example%20Corp%22" \
  -H "X-API-Key: YOUR_KEY"

# WHOIS domain lookup
curl "https://app.netlas.io/api/whois_domains/?q=domain:example.com" \
  -H "X-API-Key: YOUR_KEY"

# Host profile for specific IP
curl "https://app.netlas.io/api/host/1.2.3.4/" \
  -H "X-API-Key: YOUR_KEY"

# Count results before fetching
curl "https://app.netlas.io/api/count/?q=http.title:%22phpMyAdmin%22&start=0&indices=" \
  -H "X-API-Key: YOUR_KEY"
```

### Netlas Query Syntax

```
# Search by HTTP response title
http.title:"Admin Panel"

# Search by HTTP response body content
http.body:"Welcome to phpMyAdmin"

# Search by server header
http.headers.server:"Apache/2.4.41"

# Search by port and service
port:3306 AND protocol:mysql

# Search by country
geo.country:"CZ"

# Search by ASN
asn:47232

# Certificate subject organization
certificate.subject.organization:"Example Corp"

# Certificate SAN entries
certificate.subject_alt_name.dns_names:*.example.com

# Combined: find WordPress sites in Czech Republic
http.body:"wp-content" AND geo.country:"CZ"

# Find exposed development environments
http.title:"Laravel" AND (http.body:"APP_DEBUG" OR http.body:"whoops")

# Find misconfigured databases
port:27017 AND http.body:"totalSize"
```

### Elixir Integration

```elixir
# Search HTTP responses for exposed admin panels
{:ok, results} = PrismaticOsint.Netlas.response_search(
  "http.title:\"Admin Panel\" AND host:example.com",
  limit: 100
)
# => %{count: 3, items: [
#   %{host: "admin.example.com", port: 443, title: "Admin Panel",
#     server: "nginx/1.24.0", status_code: 200}
# ]}

# DNS search with full record details
{:ok, dns} = PrismaticOsint.Netlas.dns_search("example.com")
# => %{records: [
#   %{type: "A", value: "1.2.3.4", ttl: 3600},
#   %{type: "MX", value: "mail.example.com", priority: 10}
# ]}

# Certificate search by organization
{:ok, certs} = PrismaticOsint.Netlas.cert_search(
  "certificate.subject.organization:\"Example Corp\"",
  limit: 50
)

# Domain intelligence with technology detection
{:ok, domain} = PrismaticOsint.Netlas.domain("example.com")
# => %{subdomains: ["www", "mail", "api", "staging"],
#       technologies: ["nginx", "React", "PostgreSQL"],
#       hosting: "AWS", asn: 16509}

# Full host profile
{:ok, host} = PrismaticOsint.Netlas.host("1.2.3.4")
# => %{ports: [80, 443, 8080], services: [...],
#       certificates: [...], vulnerabilities: ["CVE-2024-1234"]}

# Statistical aggregation
{:ok, stats} = PrismaticOsint.Netlas.stats(
  "http.title:\"phpMyAdmin\"",
  field: "geo.country"
)
# => %{total: 45000, buckets: [{"US", 12000}, {"DE", 5000}, {"CZ", 1200}]}
```

## Data Schema

| Field | Type | Description |
|-------|------|-------------|
| `ip` | string | IP address of the host |
| `port` | integer | Service port number |
| `protocol` | string | Protocol (http, https, ftp, ssh, etc.) |
| `http.status_code` | integer | HTTP response status code |
| `http.title` | string | HTML page title |
| `http.body` | string | Full HTTP response body (searchable) |
| `http.headers` | object | All HTTP response headers |
| `http.headers.server` | string | Server software identification |
| `certificate.subject` | object | Certificate subject fields |
| `certificate.issuer` | object | Certificate issuer fields |
| `certificate.validity` | object | Not before/after dates |
| `certificate.subject_alt_name` | array | SAN DNS entries |
| `geo.country` | string | Geolocation country code |
| `geo.city` | string | Geolocation city name |
| `asn` | integer | Autonomous System Number |
| `whois` | object | Domain registration data |
| `technologies` | array | Detected web technologies |
| `vulnerabilities` | array | Matched CVE identifiers |

## Use Cases

### Web Application Discovery

Netlas's response-level search enables discovery of specific web applications across the internet. Security teams search for instances of their organization's applications, finding shadow IT deployments, forgotten staging environments, and unauthorized copies. The ability to search within HTTP response bodies makes it possible to find applications by unique strings, error messages, or configuration artifacts.

### Attack Surface Analysis

For [attack surface](/glossary/attack-surface/) management, Netlas provides comprehensive visibility into an organization's internet-facing assets. By combining response search, DNS enumeration, and certificate discovery, analysts build complete inventories of web-facing infrastructure including services that may not be linked to known domains.

### Certificate Intelligence

Netlas's certificate index enables discovery of related infrastructure through shared certificates, certificate authority analysis, and Subject Alternative Name (SAN) enumeration. This is particularly valuable for discovering subdomains and related services that share certificates with known infrastructure.

### Vulnerability Assessment

By mapping detected software versions to known CVEs, Netlas provides passive [vulnerability assessment](/glossary/vulnerability-assessment/) without sending any traffic to the target. This enables security teams to assess their exposure to newly disclosed vulnerabilities across their entire internet-facing estate.

### Competitive and Market Intelligence

By searching for specific technologies, frameworks, or configurations, analysts map market adoption of products, identify competitor deployments, and track technology trends across industries and geographies.

## Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Free tier limited** | 50 queries/month with 20 results each | Upgrade for serious investigation work |
| **Scan lag** | New services may take days to appear | Combine with active scanning for time-sensitive targets |
| **IPv6 coverage** | IPv6 scanning less comprehensive than IPv4 | Supplement with IPv6-focused tools |
| **Response body truncation** | Very large responses may be truncated | Use host API for full details |
| **Newer platform** | Smaller historical dataset than established competitors | Growing rapidly; use alongside Shodan/Censys for cross-validation |

## Legal and Ethical Considerations

**Passive Scanning**: Netlas indexes results from its own internet scanning infrastructure. Using Netlas to search these results is passive reconnaissance that does not generate any traffic to target systems. This is generally considered legal and ethical.

**Responsible Disclosure**: If Netlas searches reveal critical vulnerabilities or data exposures affecting third parties, analysts should consider responsible disclosure to the affected organizations.

**Terms of Service**: Netlas prohibits using the platform for unauthorized access, harassment, or any activity that violates applicable law. Research and security assessment must be conducted within legal boundaries.

## Integration with Prismatic Platform

Within the [Prismatic Platform](/apps/prismatic/), Netlas serves as a supplementary internet intelligence source alongside [Shodan](/osint/shodan/) and [Censys](/osint/censys/).

- **Response-Level Search**: Netlas's unique response body search capability fills gaps left by banner-only scanners, enabling discovery of applications by content.
- **Certificate Correlation**: Certificate intelligence feeds into the platform's infrastructure mapping, linking related services through shared certificates.
- **Cross-Scanner Validation**: Results are cross-referenced with Shodan, Censys, and [ONYPHE](/osint/onyphe/) for multi-source validation.
- **Technology Tracking**: Detected technologies feed into [Prismatic Perimeter](/apps/prismatic-perimeter/) technology profiles for comprehensive attack surface management.
- **Vulnerability Alerting**: CVE mappings trigger automated vulnerability alerts for monitored assets.

## Best Practices

1. **Use response search for application discovery**: Netlas's response body search is its unique strength. Leverage it for finding specific applications by content.

2. **Combine indices**: Use response, DNS, and certificate searches together for comprehensive asset discovery.

3. **Count before querying**: Use the `/api/count/` endpoint to assess result volume before consuming query credits.

4. **Use statistical aggregation**: The stats endpoint provides geographic and technology distribution insights without fetching individual results.

5. **Filter by geography**: Use `geo.country` filters to scope searches to relevant jurisdictions.

6. **Monitor certificate SANs**: Certificate SAN entries often reveal subdomains and related services not visible through DNS enumeration alone.

## Related Providers

- [Shodan](/osint/shodan/) - Internet device search engine
- [Censys](/osint/censys/) - Internet-wide scanning platform
- [FullHunt](/osint/fullhunt/) - [Attack surface](/glossary/attack-surface/) platform
- [ZoomEye](/osint/zoomeye/) - Cyberspace search engine
- [ONYPHE](/osint/onyphe/) - French cyber defense search
- [SecurityTrails](/osint/securitytrails/) - DNS and domain intelligence

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)