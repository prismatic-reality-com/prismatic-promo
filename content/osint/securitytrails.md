+++
title = "SecurityTrails"
weight = 31
[extra]
icon = "globe"
color = "cyan"
category = "global"
type = "domain"
module = "SecurityTrails"
source_type = "domain"
description = "DNS and domain intelligence - comprehensive historical DNS records, WHOIS, and subdomain data"
has_api = true
url = "https://securitytrails.com"
rate_limit = "Free: 50 req/mo, API plans from $50/mo"
capabilities = ["DNS History", "Subdomain Enumeration", "WHOIS History", "Reverse DNS", "IP Neighbors", "Associated Domains"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1535
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["SecurityTrails", "WHOIS", "osint", "global", "Prismatic Platform", "Filter"]
tags = ["osint", "global", "securitytrails", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "SecurityTrails - Prismatic Platform"
+++

## Overview

SecurityTrails is a comprehensive DNS and domain intelligence platform that maintains one of the largest databases of historical DNS records, [WHOIS](@/glossary/whois.md) data, and domain intelligence. Acquired by Recorded Future in 2022, the platform continuously monitors DNS changes across the internet, indexing billions of DNS records and maintaining years of historical data. This enables analysts to track infrastructure changes, discover related domains through shared DNS infrastructure, and map the complete digital footprint of organizations over time.

For [OSINT](@/glossary/osint.md) investigations, SecurityTrails is essential for discovering the full domain and subdomain landscape of a target, identifying infrastructure relationships through shared IP addresses or nameservers, and tracing the historical evolution of an organization's online presence. The platform's subdomain enumeration capability alone makes it indispensable for [attack surface](@/glossary/attack-surface.md) mapping, revealing domains that may not be discoverable through certificate transparency or active scanning.

SecurityTrails differentiates itself through the depth and breadth of its historical DNS database. While services like [DNSDumpster](@/osint/dnsdumpster.md) provide snapshots of current DNS state, SecurityTrails maintains a longitudinal record of how DNS configurations have changed over time. This temporal dimension is critical for investigations: DNS history reveals previous hosting providers, infrastructure migrations, and the timing of configuration changes that may correspond to organizational events or security incidents.

The platform's Domain Search Language (DSL) enables complex queries across the entire database, supporting searches by registrant organization, nameserver, IP range, mail server, and more. This structured query capability transforms SecurityTrails from a simple lookup tool into a powerful intelligence platform for mapping infrastructure relationships at scale.

## Data Sources and Coverage

SecurityTrails collects DNS intelligence through continuous passive monitoring and active resolution across the global DNS infrastructure.

| Data Type | Description | Historical Depth |
|-----------|-------------|-----------------|
| **A Records** | IPv4 address mappings with full change history | 10+ years |
| **AAAA Records** | IPv6 address mappings with history | 5+ years |
| **MX Records** | Mail server configurations and changes | 10+ years |
| **NS Records** | Nameserver delegations and migrations | 10+ years |
| **SOA Records** | Zone authority information | 10+ years |
| **TXT Records** | SPF, DKIM, domain verification records | 5+ years |
| **CNAME Records** | Canonical name aliases and CDN mappings | 10+ years |
| **Subdomains** | All discovered subdomains for any domain | Comprehensive, continuously updated |
| **WHOIS Data** | Current and historical registration information | Multiple years |
| **IP Neighbors** | Other domains hosted on the same IP address | Current + historical |
| **Associated Domains** | Domains sharing infrastructure or registrant data | Current + historical |
| **Hosting History** | IP address changes and hosting provider migrations | Multi-year |

### Domain Search Language (DSL)

SecurityTrails' DSL enables structured queries across the entire database.

| DSL Filter | Description | Example |
|-----------|-------------|---------|
| `ipv4` | Filter by IPv4 address or CIDR range | `ipv4 = "1.2.3.0/24"` |
| `ipv6` | Filter by IPv6 address | `ipv6 = "2001:db8::1"` |
| `mx` | Filter by mail server | `mx = "mx.google.com"` |
| `ns` | Filter by nameserver | `ns = "ns1.cloudflare.com"` |
| `cname` | Filter by CNAME target | `cname = "cdn.example.com"` |
| `subdomain` | Filter by subdomain pattern | `subdomain = "vpn"` |
| `soa_email` | Filter by SOA email | `soa_email = "admin@example.com"` |
| `tld` | Filter by top-level domain | `tld = "io"` |
| `whois_organization` | Filter by registrant organization | `whois_organization = "Example Corp"` |
| `whois_email` | Filter by registrant email | `whois_email = "admin@example.com"` |
| `keyword` | Full-text search in domain names | `keyword = "prismatic"` |

## API Integration

SecurityTrails provides a well-documented REST API at `https://api.securitytrails.com/v1/` with JSON responses. Authentication is via API key in the `APIKEY` header.

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/domain/{domain}` | GET | Current DNS records and WHOIS summary |
| `/v1/domain/{domain}/subdomains` | GET | All discovered subdomains |
| `/v1/history/{domain}/dns/{type}` | GET | Historical DNS record changes |
| `/v1/history/{domain}/whois` | GET | Historical registration changes |
| `/v1/ips/nearby/{ip}` | GET | Domains sharing same IP |
| `/v1/domain/{domain}/associated` | GET | Infrastructure-linked domains |
| `/v1/ips/{ip}` | GET | Domains resolving to IP |
| `/v1/domains/list` | POST | Domain Search Language queries |
| `/v1/search/list` | POST | Advanced multi-filter search |
| `/v1/feeds/domains/new` | GET | Newly registered domains feed |
| `/v1/feeds/domains/dropped` | GET | Recently dropped domains feed |

### Rate Limits by Plan

| Plan | Queries/Month | Features | Price |
|------|---------------|----------|-------|
| **Free** | 50 | Basic lookups, limited subdomains | $0 |
| **Starter** | 10,000 | Full API, DSL search, feeds | $50/mo |
| **Professional** | 50,000 | Priority access, higher limits | $200/mo |
| **Enterprise** | Custom | Dedicated support, bulk data | Custom |

## Query Examples

### curl Examples

```bash
# Get current DNS records for a domain
curl -H "APIKEY: YOUR_KEY" \
  "https://api.securitytrails.com/v1/domain/example.com"

# Enumerate all subdomains
curl -H "APIKEY: YOUR_KEY" \
  "https://api.securitytrails.com/v1/domain/example.com/subdomains"

# Get A record history
curl -H "APIKEY: YOUR_KEY" \
  "https://api.securitytrails.com/v1/history/example.com/dns/a"

# Get WHOIS history
curl -H "APIKEY: YOUR_KEY" \
  "https://api.securitytrails.com/v1/history/example.com/whois"

# Find domains sharing the same IP
curl -H "APIKEY: YOUR_KEY" \
  "https://api.securitytrails.com/v1/ips/nearby/1.2.3.4"

# Reverse DNS lookup - all domains on an IP
curl -H "APIKEY: YOUR_KEY" \
  "https://api.securitytrails.com/v1/ips/1.2.3.4"

# Find associated domains
curl -H "APIKEY: YOUR_KEY" \
  "https://api.securitytrails.com/v1/domain/example.com/associated"

# Domain Search Language - find all domains on a specific nameserver
curl -X POST -H "APIKEY: YOUR_KEY" -H "Content-Type: application/json" \
  "https://api.securitytrails.com/v1/domains/list" \
  -d '{"filter": {"ns": "ns1.cloudflare.com"}, "page": 1}'

# DSL - find domains by registrant organization
curl -X POST -H "APIKEY: YOUR_KEY" -H "Content-Type: application/json" \
  "https://api.securitytrails.com/v1/domains/list" \
  -d '{"filter": {"whois_organization": "Example Corp"}, "page": 1}'

# Get newly registered domains feed
curl -H "APIKEY: YOUR_KEY" \
  "https://api.securitytrails.com/v1/feeds/domains/new?tld=com"
```

### Elixir Integration

```elixir
# Get comprehensive domain details
{:ok, details} = PrismaticOsint.SecurityTrails.domain_details("example.com")
# => %{
#   domain: "example.com",
#   a_records: [%{ip: "1.2.3.4", ip_organization: "Cloudflare"}],
#   mx_records: [%{host: "mx.google.com", priority: 10}],
#   ns_records: [%{nameserver: "ns1.cloudflare.com"}],
#   txt_records: ["v=spf1 include:_spf.google.com ~all"],
#   alexa_rank: 12345,
#   hostname: "example.com"
# }

# Enumerate all subdomains
{:ok, subdomains} = PrismaticOsint.SecurityTrails.subdomains("example.com")
# => ["www.example.com", "mail.example.com", "vpn.example.com",
#     "dev.example.com", "staging.example.com", "api.example.com",
#     "cdn.example.com", "admin.example.com"]

# Get DNS history - trace infrastructure changes
{:ok, history} = PrismaticOsint.SecurityTrails.dns_history("example.com", "a")
# => [
#   %{type: "a", values: [%{ip: "1.2.3.4"}],
#     first_seen: "2025-06-01", last_seen: "2026-02-15",
#     organizations: ["Cloudflare"]},
#   %{type: "a", values: [%{ip: "5.6.7.8"}],
#     first_seen: "2020-01-01", last_seen: "2025-05-31",
#     organizations: ["AWS"]}
# ]

# WHOIS history - track ownership changes
{:ok, whois_history} = PrismaticOsint.SecurityTrails.whois_history("example.com")
# => [%{registrant: "Example Corp", registrar: "Namecheap",
#       created: "2015-03-01", updated: "2025-06-15"}]

# DSL search - find all domains owned by an organization
{:ok, owned_domains} = PrismaticOsint.SecurityTrails.dsl_search(
  %{whois_organization: "Example Corp"},
  page: 1
)
# => %{total: 47, domains: ["example.com", "example.org", ...]}

# Find IP neighbors (co-hosted domains)
{:ok, neighbors} = PrismaticOsint.SecurityTrails.ip_neighbors("1.2.3.4")
# => %{blocks: [%{ip: "1.2.3.4", domains: ["example.com", "other.com"]}]}

# Full attack surface discovery pipeline
{:ok, surface} = PrismaticOsint.Pipeline.discover_attack_surface("example.com",
  sources: [:securitytrails, :crtsh, :shodan, :censys],
  include_associated: true
)
```

## Data Schema

| Field | Type | Description |
|-------|------|-------------|
| `hostname` | string | Queried domain name |
| `current_dns.a.values[].ip` | string | Current A record IP addresses |
| `current_dns.a.values[].ip_organization` | string | IP address organization |
| `current_dns.aaaa.values[].ipv6` | string | Current AAAA record IPv6 addresses |
| `current_dns.mx.values[].host` | string | Mail server hostname |
| `current_dns.mx.values[].priority` | integer | MX record priority |
| `current_dns.ns.values[].nameserver` | string | Nameserver hostname |
| `current_dns.soa.values[].email` | string | SOA record administrative email |
| `current_dns.txt.values[].value` | string | TXT record content |
| `subdomain_count` | integer | Total number of discovered subdomains |
| `subdomains` | array | List of subdomain prefixes |
| `records[].type` | string | DNS record type for historical queries |
| `records[].values` | array | Record values at that point in time |
| `records[].first_seen` | date | First observation of this configuration |
| `records[].last_seen` | date | Last observation of this configuration |
| `records[].organizations` | array | Hosting organizations for the IPs |
| `alexa_rank` | integer | Alexa traffic rank (when available) |
| `whois.registrant_org` | string | Registrant organization name |
| `whois.registrar` | string | Domain registrar |
| `whois.created_date` | date | Domain creation date |
| `whois.updated_date` | date | Last WHOIS update date |
| `whois.expires_date` | date | Domain expiration date |

## Use Cases

### Attack Surface Mapping

SecurityTrails is the foundational tool for mapping an organization's complete domain infrastructure as part of External Attack Surface Management (EASM) assessments. Subdomain enumeration reveals the full scope of internet-facing assets including development servers, staging environments, VPN gateways, and internal tools that may be unintentionally exposed. Historical DNS records identify shadow IT and forgotten infrastructure that may no longer be actively managed but remains reachable.

### Historical Infrastructure Analysis

DNS history reveals infrastructure decisions, migrations, and potential security incidents over time. Analysts track domain hosting changes to identify infrastructure migrations (e.g., AWS to Azure), discover previous hosting providers and CDN configurations, and identify DNS changes that may correlate with security incidents such as domain hijacking or unauthorized modifications.

### Domain Intelligence and Brand Protection

Reverse WHOIS searches through the DSL enable discovery of all domains registered by the same organization or individual. This is critical for mapping the complete domain portfolio of a target organization, identifying potential typosquatting domains, and tracking WHOIS changes that may indicate domain transfers or hijacking attempts.

### Threat Actor Infrastructure Mapping

Security researchers pivot from known malicious domains to discover related infrastructure through shared IPs, nameservers, and hosting patterns. DNS history reveals the evolution of C2 infrastructure over time, and the DSL enables broad searches for domains matching threat actor patterns.

### New Domain Monitoring

SecurityTrails' newly registered and dropped domain feeds enable proactive monitoring for domains that may target an organization. New registrations containing brand keywords or common typosquatting patterns can be detected within hours of registration, enabling early response to phishing campaigns.

## Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Free tier limits** | 50 queries/month severely limits investigation scope | Use paid plans for production; cache aggressively |
| **Subdomain completeness** | Passive enumeration may miss some subdomains | Combine with [crt.sh](@/osint/crtsh.md), [DNSDumpster](@/osint/dnsdumpster.md), and active scanning |
| **WHOIS redaction** | GDPR-era WHOIS increasingly redacted | Use historical data; combine with reverse WHOIS techniques |
| **DSL query limits** | Complex DSL queries may timeout on large result sets | Use pagination and narrowing filters |
| **Real-time gaps** | DNS changes may take hours to appear in database | Use active DNS for real-time verification |
| **No service detection** | DNS only, no port scanning or service identification | Combine with [Shodan](@/osint/shodan.md) or [Censys](@/osint/censys.md) for service data |

## Legal and Ethical Considerations

**Public DNS Data**: SecurityTrails collects DNS data from publicly accessible DNS infrastructure. DNS records are not considered private information and their collection is standard practice in the security industry.

**WHOIS Data**: While WHOIS data is publicly available, GDPR restrictions have reduced the availability of registrant contact information for European domains. Analysts should be aware of local regulations governing the use of WHOIS-derived personal data.

**Reconnaissance Scope**: When using SecurityTrails for authorized security assessments, ensure that subdomain enumeration and infrastructure mapping activities fall within the agreed scope of engagement.

**Data Retention**: Organizations using SecurityTrails data in investigations should maintain appropriate data retention policies, particularly for any personal data discovered through WHOIS lookups.

## Integration with Prismatic Platform

Within the [Prismatic Platform](@/apps/prismatic.md), SecurityTrails serves as the primary DNS intelligence source for attack surface discovery and infrastructure investigation.

- **Perimeter EASM**: SecurityTrails provides the foundation for [Prismatic Perimeter](@/apps/prismatic-perimeter.md) domain discovery, feeding subdomain enumeration and DNS history into the attack surface model.
- **Attack Surface Mapping**: Domain and subdomain data is correlated with [Shodan](@/osint/shodan.md), [Censys](@/osint/censys.md), and [crt.sh](@/osint/crtsh.md) for comprehensive infrastructure mapping.
- **Infrastructure Graphing**: DNS relationships feed the platform's [knowledge graph](@/glossary/knowledge-graph.md), enabling visual exploration of domain-IP-nameserver relationships.
- **DSL-Powered Search**: The platform exposes SecurityTrails' DSL through its investigation interface, enabling structured queries across the DNS database.
- **Change Monitoring**: DNS changes for monitored domains trigger alerts in the Perimeter dashboard, supporting continuous attack surface monitoring.
- **Cross-Source Validation**: SecurityTrails findings are cross-referenced with [RiskIQ](@/osint/riskiq.md), [PassiveDNS](@/osint/passivedns.md), and [WhoisXML](@/osint/whoisxml.md) for multi-source DNS intelligence.

## Best Practices

1. **Start with subdomain enumeration**: Subdomain discovery is SecurityTrails' strongest capability. Always start investigations with a full subdomain enumeration to map the target's complete domain landscape.

2. **Use DSL for bulk discovery**: The Domain Search Language enables efficient discovery of all domains owned by an organization through registrant, nameserver, or IP-based searches.

3. **Cross-reference DNS history with events**: Plot DNS changes on a timeline alongside known organizational events (acquisitions, migrations, incidents) to correlate infrastructure changes with business activities.

4. **Cache and reuse results**: SecurityTrails data changes relatively slowly. Cache results for days to weeks to maximize the value of limited API quotas.

5. **Combine with certificate transparency**: SecurityTrails subdomain enumeration combined with [crt.sh](@/osint/crtsh.md) certificate searches provides the most comprehensive subdomain coverage available.

6. **Monitor new domain feeds**: Set up monitoring for newly registered domains matching target brand patterns to detect phishing campaigns early.

7. **Check IP neighbors carefully**: Co-hosted domains may or may not be related to the target. Use additional evidence (WHOIS, content analysis) to confirm relationships.

## Related Providers

- [DNSDumpster](@/osint/dnsdumpster.md) - Free DNS reconnaissance tool
- [ViewDNS](@/osint/viewdns.md) - Reverse IP and DNS toolkit
- [WhoisXML API](@/osint/whoisxml.md) - WHOIS and DNS intelligence
- [RiskIQ](@/osint/riskiq.md) - Passive DNS with host pairs and web crawling
- [PassiveDNS](@/osint/passivedns.md) - Historical DNS resolution databases
- [Censys](@/osint/censys.md) - Internet-wide scanning with certificate intelligence
- [Shodan](@/osint/shodan.md) - Device and service discovery for discovered IPs
- [crt.sh](@/osint/crtsh.md) - Certificate transparency for subdomain discovery

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)