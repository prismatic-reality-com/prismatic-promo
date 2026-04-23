+++
title = "WhoisXML API"
weight = 44
[extra]
category = "global"
type = "domain"
module = "WhoisXml"
description = "Comprehensive WHOIS, DNS, and IP intelligence with historical data"
has_api = true
url = "https://whoisxmlapi.com"
rate_limit = "500 req/month (free), tiered plans available"
capabilities = ["WHOIS Lookup", "DNS Intelligence", "Reverse WHOIS", "Domain Availability", "IP Geolocation", "Subdomain Discovery"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1577
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["WhoisXML", "API", "Comprehensive", "WHOIS", "osint", "global", "Prismatic Platform", "WhoisXML API"]
tags = ["osint", "global", "whoisxml-api", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "WhoisXML API - Prismatic Platform"
+++

## Overview

WhoisXML API provides enterprise-grade domain and IP intelligence through a comprehensive suite of over 50 APIs and data feeds. The platform maintains one of the largest [WHOIS](/glossary/whois/) databases globally, with over 7 billion historical WHOIS records spanning more than a decade, covering all gTLDs and over 1,000 ccTLDs. The service aggregates WHOIS registration data, DNS records, IP geolocation, subdomain intelligence, domain reputation, and website categorization into a unified API platform that powers security operations, brand protection, law enforcement investigations, and competitive intelligence research.

For [OSINT](/glossary/osint/) investigators, WhoisXML API provides the foundational domain and infrastructure intelligence needed for any internet-focused investigation. The platform's reverse WHOIS capability -- searching for all domains registered by a specific person, email, or organization -- is particularly powerful for mapping an entity's complete domain portfolio. Combined with DNS intelligence, subdomain discovery, and IP geolocation, WhoisXML API enables comprehensive infrastructure mapping from a single starting point.

WhoisXML API distinguishes itself through the breadth of its product suite and the depth of its historical data. While many providers offer individual WHOIS or DNS lookup services, WhoisXML API provides an integrated platform that covers the full spectrum of domain and IP intelligence. The historical dimension is particularly valuable: even after GDPR-mandated WHOIS redaction reduced the availability of current registrant data, WhoisXML API's historical database retains pre-GDPR registration information that can still provide investigative leads.

The platform serves as a data provider to many downstream security products and services. Its APIs are integrated into SIEMs, SOARs, threat intelligence platforms, and investigation tools across the security industry, making WhoisXML API a foundational data layer for internet intelligence operations.

## Data Sources and Coverage

WhoisXML API aggregates intelligence from multiple data collection systems across the global internet infrastructure.

| Product | Description | Coverage |
|---------|-------------|----------|
| **WHOIS API** | Real-time and parsed WHOIS registration data | All gTLDs, 1,000+ ccTLDs |
| **WHOIS History API** | Historical WHOIS records with change tracking | 7B+ records, 10+ years |
| **DNS Lookup API** | All DNS record types with propagation checking | Global DNS infrastructure |
| **Reverse WHOIS API** | Search by registrant name, email, organization | All indexed domains |
| **Reverse DNS API** | Domains resolving to a specific IP | Comprehensive coverage |
| **Reverse MX API** | Domains using specific mail servers | All indexed MX records |
| **Reverse NS API** | Domains using specific nameservers | All indexed NS records |
| **Subdomain Lookup API** | Passive subdomain enumeration | Millions of domains |
| **Domain Reputation API** | Threat scoring and categorization | Real-time scoring |
| **Website Categorization** | Content classification for domains | 70+ categories |
| **IP Geolocation API** | Physical and network location data | All IPv4 and IPv6 |
| **IP Netblocks API** | Network block ownership and allocation | All RIR data |
| **Email Verification API** | Deliverability and existence checking | Any email address |
| **Website Contact API** | Contact information extraction | Crawled websites |
| **Domain Availability API** | Real-time registration status | All gTLDs |
| **Newly Registered Domains** | Daily feed of new registrations | All gTLDs |
| **Dropped Domains** | Daily feed of expired/dropped domains | All gTLDs |

### WHOIS Data Coverage

| Region | gTLD Coverage | ccTLD Coverage | Historical Depth |
|--------|--------------|---------------|-----------------|
| **Global (gTLDs)** | .com, .net, .org, .info, .biz, 1500+ new gTLDs | Complete | 10+ years |
| **Europe** | .de, .uk, .fr, .nl, .cz, .eu | Most major ccTLDs | 5-10 years |
| **Americas** | .us, .ca, .br, .mx, .co | Major ccTLDs | 5-10 years |
| **Asia-Pacific** | .cn, .jp, .au, .in, .kr | Major ccTLDs | 5-10 years |
| **Other** | .ru, .za, .ae, .il, .ng | Growing coverage | Varies |

## API Integration

WhoisXML API provides REST APIs with JSON responses. Authentication uses API key as a query parameter or header.

### Core API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/WhoisService/WhoisService` | GET | WHOIS lookup with parsed output |
| `/WhoisHistoryService/WhoisHistoryService` | GET | Historical WHOIS records |
| `/ReverseWhoisService/ReverseWhoisService` | POST | Reverse WHOIS search |
| `/DNSService/DNSService` | GET | DNS record lookup (all types) |
| `/ReverseDNSService/ReverseDNSService` | GET | Reverse DNS by IP |
| `/ReverseMXService/ReverseMXService` | GET | Reverse MX lookup |
| `/ReverseNSService/ReverseNSService` | GET | Reverse NS lookup |
| `/SubdomainsLookup/SubdomainsLookupService` | GET | Subdomain enumeration |
| `/DomainReputation/DomainReputationService` | GET | Domain threat scoring |
| `/WebsiteCategorization/WebsiteCategorizationService` | GET | Content categorization |
| `/GeoIPService/GeoIPService` | GET | IP geolocation |
| `/EmailVerification/EmailVerificationService` | GET | Email validation |

### Rate Limits by Plan

| Plan | Credits/Month | DRS Queries | Features | Price |
|------|--------------|-------------|----------|-------|
| **Free** | 500 | 100 | Basic lookups, limited history | $0 |
| **Starter** | 5,000 | 1,000 | Full API, parsed output | $29/mo |
| **Professional** | 25,000 | 5,000 | All APIs, bulk queries | $99/mo |
| **Enterprise** | Custom | Custom | Dedicated support, SLA | Custom |

## Query Examples

### curl Examples

```bash
# WHOIS lookup with parsed output
curl "https://www.whoisxmlapi.com/whoisserver/WhoisService?domainName=example.com&outputFormat=JSON&apiKey=YOUR_KEY"

# Historical WHOIS records
curl "https://whois-history.whoisxmlapi.com/api/v1?domainName=example.com&apiKey=YOUR_KEY&mode=purchase"

# Reverse WHOIS - find all domains by registrant
curl -X POST "https://reverse-whois.whoisxmlapi.com/api/v2" \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "YOUR_KEY", "searchType": "current", "mode": "purchase", "basicSearchTerms": {"include": ["john@example.com"]}}'

# DNS lookup (all record types)
curl "https://www.whoisxmlapi.com/whoisserver/DNSService?domainName=example.com&type=_all&outputFormat=JSON&apiKey=YOUR_KEY"

# Reverse DNS - domains on an IP
curl "https://dns-history.whoisxmlapi.com/api/v1?apiKey=YOUR_KEY&ip=1.2.3.4"

# Subdomain enumeration
curl "https://subdomains.whoisxmlapi.com/api/v1?domainName=example.com&apiKey=YOUR_KEY&outputFormat=JSON"

# Domain reputation scoring
curl "https://domain-reputation.whoisxmlapi.com/api/v1?domainName=example.com&apiKey=YOUR_KEY"

# IP geolocation
curl "https://ip-geolocation.whoisxmlapi.com/api/v1?ipAddress=1.2.3.4&apiKey=YOUR_KEY"

# Email verification
curl "https://emailverification.whoisxmlapi.com/api/v3?emailAddress=test@example.com&apiKey=YOUR_KEY"

# Website categorization
curl "https://website-categorization.whoisxmlapi.com/api/v3?domainName=example.com&apiKey=YOUR_KEY"

# Reverse MX - domains using specific mail server
curl "https://reverse-mx.whoisxmlapi.com/api/v1?mx=mx.google.com&apiKey=YOUR_KEY"
```

### Elixir Integration

```elixir
# WHOIS lookup with full parsed data
{:ok, whois} = PrismaticOsint.WhoisXml.lookup("example.com")
# => %{
#   domain: "example.com",
#   registrar: "Namecheap, Inc.",
#   created: ~D[2010-01-15],
#   updated: ~D[2025-06-01],
#   expires: ~D[2027-01-15],
#   registrant: %{
#     name: "Domain Admin",
#     organization: "Example Corp",
#     email: "admin@example.com",
#     country: "US"
#   },
#   nameservers: ["ns1.cloudflare.com", "ns2.cloudflare.com"],
#   status: ["clientTransferProhibited"]
# }

# Historical WHOIS - track ownership changes
{:ok, history} = PrismaticOsint.WhoisXml.history("example.com")
# => %{
#   domain: "example.com",
#   records_count: 15,
#   records: [
#     %{date: ~D[2025-06-01], registrant: "Example Corp", registrar: "Namecheap"},
#     %{date: ~D[2022-03-15], registrant: "Previous Owner LLC", registrar: "GoDaddy"},
#     %{date: ~D[2018-01-01], registrant: "Original Corp", registrar: "Name.com"}
#   ]
# }

# Reverse WHOIS - find all domains by registrant
{:ok, domains} = PrismaticOsint.WhoisXml.reverse("admin@example.com",
  search_type: :current
)
# => %{
#   total: 47,
#   domains: ["example.com", "example.org", "example-shop.com",
#     "corporate-site.com", "product-landing.io"]
# }

# Subdomain discovery
{:ok, subs} = PrismaticOsint.WhoisXml.subdomains("example.com")
# => %{
#   domain: "example.com",
#   subdomains: ["www", "mail", "cdn", "api", "dev", "staging",
#     "vpn", "admin", "blog", "shop"]
# }

# Domain reputation scoring
{:ok, reputation} = PrismaticOsint.WhoisXml.reputation("suspicious-domain.com")
# => %{
#   domain: "suspicious-domain.com",
#   reputation_score: 23.5,  # 0-100, lower is worse
#   warnings: [
#     %{type: "malware", source: "Google Safe Browsing"},
#     %{type: "newly_registered", days_old: 15}
#   ]
# }

# IP geolocation with network details
{:ok, geo} = PrismaticOsint.WhoisXml.geolocate("1.2.3.4")
# => %{
#   ip: "1.2.3.4",
#   country: "US", region: "California", city: "San Francisco",
#   lat: 37.7749, lng: -122.4194,
#   isp: "Cloudflare, Inc.", organization: "Cloudflare",
#   asn: "AS13335", connection_type: "Corporate"
# }

# Comprehensive domain investigation pipeline
{:ok, investigation} = PrismaticOsint.Pipeline.domain_investigation("example.com",
  sources: [:whoisxml, :securitytrails, :crtsh, :shodan],
  include: [:whois_history, :subdomains, :reverse_whois, :dns_history, :reputation]
)
```

## Data Schema

| Field | Type | Description |
|-------|------|-------------|
| `domainName` | string | Queried domain name |
| `registrarName` | string | Domain registrar |
| `registrarIANAID` | string | IANA registrar identifier |
| `createdDateNormalized` | date | Domain creation date |
| `updatedDateNormalized` | date | Last WHOIS update date |
| `expiresDateNormalized` | date | Domain expiration date |
| `registrant.name` | string | Registrant contact name |
| `registrant.organization` | string | Registrant organization |
| `registrant.email` | string | Registrant email |
| `registrant.country` | string | Registrant country |
| `administrativeContact` | object | Administrative contact details |
| `technicalContact` | object | Technical contact details |
| `nameServers` | array | Nameserver hostnames |
| `status` | array | Domain status codes (EPP) |
| `domainAvailability` | string | Registration status |
| `reputation.reputationScore` | float | Domain reputation (0-100) |
| `reputation.warnings` | array | Threat indicators |
| `geoLocation.country` | string | IP country code |
| `geoLocation.city` | string | IP city |
| `geoLocation.isp` | string | Internet Service Provider |
| `geoLocation.as.asn` | integer | Autonomous System Number |
| `subdomains` | array | Discovered subdomains |

## Use Cases

### Domain Portfolio Mapping

Reverse WHOIS is the primary tool for discovering an organization's complete domain portfolio. By searching for registrant name, email, or organization, analysts discover all domains registered by a target entity, including brands, product domains, campaign-specific domains, and potentially sensitive internal domains.

### Infrastructure Attribution

WHOIS history combined with DNS intelligence enables attribution of internet infrastructure to specific entities. Even when current WHOIS data is redacted due to GDPR, historical records may reveal previous registrant information, providing investigative leads for infrastructure ownership determination.

### Brand Protection

WhoisXML API's newly registered domains feed enables proactive monitoring for domains that may infringe on organizational brands. By monitoring new registrations containing brand keywords, typosquatting variations, or homograph characters, organizations detect and respond to phishing campaigns and brand abuse early.

### Threat Investigation

Domain reputation scoring, combined with DNS intelligence and WHOIS data, enables rapid assessment of suspicious domains encountered during security investigations. The platform's comprehensive data model provides the context needed to determine whether a domain is associated with malicious activity.

### Attack Surface Discovery

Subdomain enumeration combined with reverse DNS and reverse NS lookups maps the complete domain infrastructure of a target organization. This feeds into External Attack Surface Management ([EASM](/glossary/easm/)) workflows alongside data from [SecurityTrails](/osint/securitytrails/) and [Shodan](/osint/shodan/).

### Fraud Investigation

Historical WHOIS data reveals domain ownership changes, registration patterns, and contact information associated with fraudulent operations. Combined with email verification and website categorization, WhoisXML API supports fraud investigation and evidence gathering.

## Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **GDPR WHOIS redaction** | Current WHOIS for EU domains increasingly redacted | Use historical records; combine with reverse WHOIS techniques |
| **Credit-based pricing** | Each API call consumes credits; complex investigations use many | Monitor credit consumption; cache results aggressively |
| **ccTLD coverage varies** | Some country-code TLDs have limited WHOIS data | Supplement with regional WHOIS services for specific ccTLDs |
| **Subdomain completeness** | Passive enumeration may miss some subdomains | Combine with [crt.sh](/osint/crtsh/) and [SecurityTrails](/osint/securitytrails/) |
| **Reputation score context** | Domain reputation is automated and may lack context | Use reputation as one signal among many; validate manually |
| **Rate limits on free tier** | 500 credits/month limits investigation scope | Use paid plans for production; implement intelligent caching |

## Legal and Ethical Considerations

**WHOIS Data Access**: WHOIS data is traditionally publicly available through the WHOIS protocol. WhoisXML API aggregates this publicly accessible data. However, GDPR has restricted access to registrant personal data for European domains since 2018.

**Reverse WHOIS Ethics**: Reverse WHOIS searches can reveal an individual's or organization's complete domain portfolio. Use this capability responsibly, particularly when investigating individuals, and ensure activities comply with applicable privacy regulations.

**Historical Data and Privacy**: Historical WHOIS records may contain personal data that registrants later chose to redact. While historical data is legally collected, responsible use includes considering the privacy implications of de-redacting information that registrants intentionally concealed.

**Data Retention**: Organizations using WhoisXML API data should establish data retention policies that comply with applicable regulations, particularly for personal data extracted from WHOIS records.

## Integration with Prismatic Platform

Within the [Prismatic Platform](/apps/prismatic/), WhoisXML API serves as the primary WHOIS and domain registration intelligence source.

- **Domain Investigation**: WhoisXML API provides the WHOIS foundation for all domain-focused investigations, including current records, historical changes, and reverse lookups.
- **Attack Surface Mapping**: Subdomain discovery and reverse DNS feed into [Prismatic Perimeter](/apps/prismatic-perimeter/) alongside [SecurityTrails](/osint/securitytrails/) and [crt.sh](/osint/crtsh/) for comprehensive domain infrastructure mapping.
- **Entity Resolution**: Reverse WHOIS searches map domain portfolios to entities in the platform's [knowledge graph](/glossary/knowledge-graph/), connecting organizational identities to their internet infrastructure.
- **Brand Monitoring**: Newly registered domain feeds are monitored for brand-relevant registrations, triggering alerts for potential phishing or brand abuse.
- **Reputation Scoring**: Domain reputation data feeds into the platform's entity risk scoring for assessed organizations and their infrastructure.
- **Cross-Source Validation**: WhoisXML API data is cross-referenced with [SecurityTrails](/osint/securitytrails/), [RiskIQ](/osint/riskiq/), and [PassiveDNS](/osint/passivedns/) for multi-source domain intelligence.

## Best Practices

1. **Start with reverse WHOIS**: When investigating an entity, begin with reverse WHOIS to discover their complete domain portfolio before investigating individual domains.

2. **Check historical WHOIS**: Even if current WHOIS is redacted, historical records often contain unredacted registrant data that provides investigative leads.

3. **Use bulk queries**: For investigations involving many domains, use batch/bulk query capabilities to maximize credit efficiency.

4. **Cache aggressively**: WHOIS data changes infrequently. Cache results for days to weeks to minimize credit consumption.

5. **Combine with DNS intelligence**: WHOIS tells you who registered a domain; DNS tells you where it points. Use both for complete infrastructure mapping.

6. **Monitor domain feeds**: Set up monitoring for newly registered domains matching brand keywords or investigation-relevant patterns.

7. **Verify email contacts**: Use the email verification API to validate discovered email addresses before using them in outreach or investigations.

8. **Use reputation scoring for triage**: Domain reputation provides a quick initial assessment. High-risk scores warrant deeper investigation; clean scores may deprioritize a domain in triage.

## Related Providers

- [SecurityTrails](/osint/securitytrails/) - DNS history and domain intelligence
- [RiskIQ](/osint/riskiq/) - Passive DNS with host pairs and web crawling
- [PassiveDNS](/osint/passivedns/) - Historical DNS resolution databases
- [Censys](/osint/censys/) - Certificate-based domain discovery
- [DNSDumpster](/osint/dnsdumpster/) - Free DNS reconnaissance
- [crt.sh](/osint/crtsh/) - Certificate transparency logs
- [Shodan](/osint/shodan/) - IP-level service discovery
- [Hunter.io](/osint/hunter-io/) - Email discovery for discovered domains

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)