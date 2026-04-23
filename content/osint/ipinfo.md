+++
title = "IPinfo"
weight = 35
[extra]
icon = "server"
color = "cyan"
category = "global"
type = "ip"
module = "IpInfo"
source_type = "IP"
description = "IP address geolocation and ASN data - comprehensive IP intelligence with abuse contact information"
has_api = true
url = "https://ipinfo.io"
rate_limit = "Free: 50,000 req/mo, Basic: $99/mo, Standard: $249/mo"
capabilities = ["IP Geolocation", "ASN Lookup", "Company Detection", "Hosted Domains", "Privacy Detection", "Abuse Contacts"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 759
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["IPinfo", "address", "geolocation", "comprehensive", "intelligence", "abuse", "contact", "osint", "global", "Prismatic Platform"]
tags = ["osint", "global", "ipinfo", "prismatic"]
quality_score = 65
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "IPinfo - Prismatic Platform"
+++

## Overview

IPinfo is a leading IP address intelligence provider that serves over 40 billion API requests monthly. It provides accurate geolocation, ASN (Autonomous System Number) information, company attribution, hosted domain reverse lookups, and privacy detection (VPN, proxy, Tor, relay). IPinfo maintains its own proprietary [data pipeline](/glossary/data-pipeline/) combining multiple sources including regional internet registries (RIRs), BGP data, and active network probing.

For [OSINT](/glossary/osint/) investigations, IPinfo provides essential context for any IP-based analysis. It answers fundamental questions about where an IP is located, who owns it, what organization uses it, whether it is a hosting provider or end-user network, and whether it is associated with privacy or anonymization services.

IPinfo differentiates itself from competitors through its data accuracy methodology. Rather than relying solely on WHOIS and RIR databases, IPinfo performs active network measurements and maintains partnerships with ISPs to verify geolocation data. This results in significantly higher accuracy, particularly for mobile networks and cloud infrastructure where traditional geolocation databases often produce incorrect results.

## Data Coverage

| Data Type | Description |
|-----------|-------------|
| **Geolocation** | Country, region, city, postal code, GPS coordinates |
| **ASN Data** | AS number, AS name, organization, routing domain, type |
| **Company Info** | Company name, domain, type (ISP, business, education, hosting) |
| **Privacy Flags** | VPN, proxy, Tor, relay, hosting detection |
| **Abuse Contact** | Network abuse reporting contact information |
| **Hosted Domains** | Domains hosted on the queried IP address |
| **Carrier** | Mobile carrier information for cellular IPs |
| **Ranges** | IP range assignment and allocation data |

### Company Type Classification

IPinfo classifies organizations operating IP addresses into distinct categories that inform intelligence analysis:

| Company Type | Description | OSINT Significance |
|-------------|-------------|-------------------|
| **ISP** | Internet Service Provider | Residential/consumer traffic |
| **Business** | Enterprise/corporate network | Direct organizational attribution |
| **Education** | Academic institution | University/research traffic |
| **Hosting** | Cloud/hosting provider | Shared infrastructure, attribution difficult |
| **Government** | Government agency | State-actor or public sector traffic |

### Privacy Detection Capabilities

The privacy detection module identifies IPs associated with anonymization and privacy services, critical for security analysis:

| Detection Type | Description | False Positive Rate |
|---------------|-------------|-------------------|
| **VPN** | Commercial VPN services (NordVPN, ExpressVPN, etc.) | <1% |
| **Proxy** | HTTP/SOCKS proxies, web proxies | <2% |
| **Tor** | Tor exit nodes | <0.5% |
| **Relay** | iCloud Private Relay, Cloudflare WARP | <1% |
| **Hosting** | Cloud/hosting provider IPs (not privacy per se) | <1% |

## Integration with Prismatic

Prismatic Platform integrates IPinfo as the primary IP intelligence enrichment source. Every IP address encountered during scanning, log analysis, or threat investigation is automatically enriched with geolocation, ASN, and privacy data.

```elixir
# Basic IP lookup
{:ok, info} = IpInfo.lookup("1.2.3.4")
# => %{
#   ip: "1.2.3.4",
#   hostname: "example.host.com",
#   city: "Los Angeles",
#   region: "California",
#   country: "US",
#   loc: "34.0522,-118.2437",
#   org: "AS13335 Cloudflare, Inc.",
#   postal: "90001",
#   timezone: "America/Los_Angeles"
# }

# ASN lookup
{:ok, asn} = IpInfo.asn("AS13335")
# => %{
#   asn: "AS13335",
#   name: "Cloudflare, Inc.",
#   domain: "cloudflare.com",
#   route: "1.0.0.0/24",
#   type: "hosting",
#   num_ips: 2_789_376,
#   prefixes: ["1.0.0.0/24", "1.1.1.0/24", ...]
# }

# Company attribution
{:ok, company} = IpInfo.company("1.2.3.4")
# => %{name: "Cloudflare, Inc.", domain: "cloudflare.com", type: "hosting"}

# Privacy/anonymization detection
{:ok, privacy} = IpInfo.privacy("1.2.3.4")
# => %{vpn: true, proxy: false, tor: false, relay: false, hosting: true,
#       service: "NordVPN"}

# Reverse IP - find hosted domains
{:ok, domains} = IpInfo.hosted_domains("93.184.216.34")
# => %{total: 47, domains: ["example.com", "example.net", ...]}

# Abuse contact lookup
{:ok, abuse} = IpInfo.abuse("1.2.3.4")
# => %{address: "abuse@cloudflare.com", country: "US", name: "Cloudflare Abuse"}

# Batch lookup (up to 1000 IPs)
{:ok, results} = IpInfo.batch(["1.2.3.4", "8.8.8.8", "93.184.216.34"])
```

### IP Intelligence Pipeline

```elixir
defmodule PrismaticPerimeter.Intelligence.IpIntelligence do
  @moduledoc """
  Comprehensive IP intelligence enrichment combining IPinfo with
  GreyNoise, AbuseIPDB, and MaxMind for multi-source analysis.
  """

  def enrich_ip(ip) do
    tasks = [
      Task.async(fn -> IpInfo.lookup(ip) end),
      Task.async(fn -> IpInfo.privacy(ip) end),
      Task.async(fn -> GreyNoise.quick(ip) end),
      Task.async(fn -> AbuseIpdb.check(ip) end)
    ]

    [info, privacy, noise, abuse] = Task.await_many(tasks, 10_000)

    {:ok, %{
      ip: ip,
      geolocation: extract_geo(info),
      organization: extract_org(info),
      privacy: extract_privacy(privacy),
      noise_classification: extract_noise(noise),
      abuse_confidence: extract_abuse(abuse),
      risk_assessment: calculate_ip_risk(info, privacy, noise, abuse),
      attribution_confidence: assess_attribution(info, privacy)
    }}
  end

  defp calculate_ip_risk(info, privacy, noise, abuse) do
    factors = []
    factors = if privacy[:vpn] || privacy[:tor], do: [:anonymized | factors], else: factors
    factors = if noise[:classification] == "malicious", do: [:malicious_activity | factors], else: factors
    factors = if abuse[:confidence_score] > 50, do: [:high_abuse_score | factors], else: factors
    factors = if info[:type] == "hosting", do: [:hosting_provider | factors], else: factors

    %{factors: factors, level: risk_level(factors)}
  end
end
```

### Geographic Risk Assessment

IPinfo geolocation data feeds into the [Prismatic Perimeter](/apps/prismatic-perimeter/) [security rating](/glossary/security-rating/) engine for geographic risk assessment:

| Risk Factor | Assessment | Weight |
|------------|-----------|--------|
| **Sanctioned country** | IP from OFAC/EU sanctioned jurisdiction | Critical |
| **High-risk geography** | IP from country with high cybercrime index | High |
| **VPN/Proxy origin** | IP identified as anonymization service | Medium |
| **Hosting provider** | IP from cloud/hosting (shared infrastructure) | Low |
| **Expected geography** | IP from expected operating country | Positive |

## Rate Limits and Access

| Tier | Requests/Month | Features | Price |
|------|---------------|----------|-------|
| **Free** | 50,000 | Geolocation, ASN basic | Free |
| **Basic** | 150,000 | + Company, privacy detection | $99/mo |
| **Standard** | 250,000 | + Hosted domains, abuse contact | $249/mo |
| **Business** | 500,000 | + Carrier data, IP ranges | $499/mo |
| **Enterprise** | Unlimited | Custom SLA, dedicated support | Custom |

### Authentication
API token via query parameter (`?token=`) or `Authorization: Bearer` header. Free tier with registration. Client libraries available for Python, Node.js, Go, Java, PHP, Ruby, and Elixir.

### Data Freshness

| Data Type | Update Frequency |
|-----------|-----------------|
| **Geolocation** | Daily updates, monthly comprehensive refresh |
| **ASN** | Real-time BGP monitoring |
| **Privacy** | Daily VPN/proxy detection updates |
| **Company** | Weekly company attribution refresh |
| **Hosted Domains** | Monthly reverse DNS scan |

## Use Cases

### Incident Response
- Geolocation of suspicious IP addresses during security incidents
- Rapid organizational attribution for attacker infrastructure
- Identifying whether traffic originates from VPN or proxy services
- Building geographic profiles of attack campaigns

### Threat Intelligence
- Attributing IP addresses to specific organizations and ISPs
- Discovering all domains hosted on suspicious servers
- Mapping threat actor infrastructure across ASNs
- Correlating with [GreyNoise](/osint/greynoise/) for comprehensive IP context

### Visitor Intelligence
- Real-time IP enrichment for the [HAWKEYE](/apps/prismatic-hawkeye/) visitor intelligence system
- Geographic access control and anomaly detection
- VPN/proxy detection for fraud prevention workflows
- Carrier detection for mobile traffic analysis

### Attack Surface Assessment
- Map organizational IP space and ASN assignments
- Identify hosting relationships and shared infrastructure
- Discover unexpected IP presence in sanctioned jurisdictions
- Feed geographic intelligence into [Prismatic Perimeter](/apps/prismatic-perimeter/) ratings

## Related Sources

- [Shodan](/osint/shodan/) - Service discovery on IP addresses
- [AbuseIPDB](/osint/abuseipdb/) - IP abuse reporting and reputation
- [GreyNoise](/osint/greynoise/) - Scanner identification for IP addresses
- [BinaryEdge](/osint/binaryedge/) - Internet scanning intelligence
- [Censys](/osint/censys/) - Certificate and service data for IPs
- [MaxMind](/osint/maxmind/) - Alternative GeoIP and fraud detection
- [IPQualityScore](/osint/ipqualityscore/) - Fraud scoring and proxy detection

## Related Platform Components

- [OSINT Core](/apps/prismatic-osint-core/) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](/apps/prismatic-perimeter/) - IP intelligence in [EASM](/glossary/easm/) ratings
- [HAWKEYE](/apps/prismatic-hawkeye/) - Visitor intelligence with IP enrichment

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)