+++
title = "ViewDNS"
weight = 41
[extra]
category = "global"
type = "domain"
module = "ViewDns"
description = "Comprehensive DNS and IP intelligence toolkit for domain research and infrastructure mapping"
has_api = true
url = "https://viewdns.info"
rate_limit = "250 req/day (free), higher tiers available"
capabilities = ["Reverse IP Lookup", "DNS Record Lookup", "IP History", "Reverse Whois", "Port Scanner", "DNS Propagation Check", "Abuse Contact Lookup", "MAC Address Lookup"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 702
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ViewDNS", "Comprehensive", "osint", "global", "Prismatic Platform", "Reverse", "Find"]
tags = ["osint", "global", "viewdns", "prismatic"]
quality_score = 65
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "ViewDNS - Prismatic Platform"
+++

## Overview

ViewDNS provides a comprehensive suite of DNS and IP intelligence tools widely used for domain research, infrastructure mapping, and digital forensics. The platform aggregates over 20 individual tools into a single API, making it a versatile resource for [OSINT](/glossary/osint/) investigations that require DNS-level intelligence.

The reverse IP lookup capability is particularly valuable -- it reveals all domains hosted on a single IP address, which is essential for identifying shared hosting relationships, mapping threat actor infrastructure, and discovering related domains. The IP history feature tracks how a domain's hosting has changed over time, creating a timeline of infrastructure moves that can reveal organizational changes, migrations, or efforts to evade detection.

ViewDNS also maintains historical [Whois](/glossary/whois/) data, enabling investigators to track domain ownership changes and identify patterns across multiple domains registered by the same entity. This makes it a key tool in the intelligence chain between DNS-level discovery and deeper entity investigation.

## Data Coverage

| Data Type | Description |
|-----------|-------------|
| **Reverse IP** | All domains hosted on a given IP address |
| **DNS Records** | A, AAAA, MX, NS, TXT, SOA, CNAME records |
| **IP History** | Historical IP addresses for a domain |
| **Reverse Whois** | Domains registered by the same entity |
| **Port Scan** | Open port detection for a target IP |
| **DNS Propagation** | Global DNS resolution from multiple locations |
| **Abuse Contact** | ISP abuse contact for IP addresses |
| **DNSBL Check** | DNS-based blocklist status for an IP |

### Intelligence Chain

```
Domain input
    |
    v
DNS Record Lookup --> Resolve to IP(s)
    |
    v
Reverse IP --> Find co-hosted domains
    |
    v
IP History --> Track infrastructure changes
    |
    v
Reverse Whois --> Identify registrant's other domains
    |
    v
Cross-reference with Shodan, Censys, crt.sh
```

## Integration with Prismatic

ViewDNS provides critical DNS-layer intelligence for the [Prismatic Perimeter](/apps/prismatic-perimeter/) [attack surface](/glossary/attack-surface/) discovery and feeds into the [OSINT Core](/apps/prismatic-osint-core/) multi-source enrichment pipeline.

```elixir
# Reverse IP lookup - find all domains on an IP
{:ok, domains} = ViewDns.reverse_ip("93.184.216.34")
# => %{
#   ip: "93.184.216.34",
#   domain_count: 47,
#   domains: ["example.com", "example.net", "example.org", ...]
# }

# Get DNS records
{:ok, records} = ViewDns.dns_record("example.com", type: :all)
# => %{
#   a: ["93.184.216.34"],
#   aaaa: ["2606:2800:220:1:248:1893:25c8:1946"],
#   mx: [%{priority: 10, host: "mail.example.com"}],
#   ns: ["ns1.example.com", "ns2.example.com"],
#   txt: ["v=spf1 include:_spf.google.com ~all"]
# }

# IP address history for a domain
{:ok, history} = ViewDns.ip_history("example.com")
# => [
#   %{ip: "93.184.216.34", location: "US", owner: "Edgecast", last_seen: "2025-12-01"},
#   %{ip: "72.21.91.8", location: "US", owner: "Amazon", last_seen: "2023-06-15"}
# ]

# Reverse Whois - find domains by registrant
{:ok, related} = ViewDns.reverse_whois("John Doe")

# Check DNS propagation globally
{:ok, propagation} = ViewDns.dns_propagation("example.com")

# Get abuse contact for an IP
{:ok, abuse} = ViewDns.abuse_contact("1.2.3.4")

# DNSBL blocklist check
{:ok, blocklist} = ViewDns.dnsbl_check("1.2.3.4")
```

### Infrastructure Mapping Pipeline

```elixir
defmodule PrismaticPerimeter.Discovery.InfrastructureMapper do
  @moduledoc """
  Maps domain infrastructure using DNS intelligence from ViewDNS.
  Discovers co-hosted domains and tracks infrastructure changes.
  """

  def map_infrastructure(domain) do
    with {:ok, dns} <- ViewDns.dns_record(domain, type: :all),
         {:ok, reverse} <- ViewDns.reverse_ip(hd(dns.a)),
         {:ok, history} <- ViewDns.ip_history(domain),
         {:ok, subdomains} <- Crtsh.enumerate_subdomains(domain) do
      {:ok, %{
        domain: domain,
        current_ip: hd(dns.a),
        co_hosted_domains: reverse.domain_count,
        shared_hosting: reverse.domain_count > 10,
        ip_changes: length(history),
        infrastructure_timeline: history,
        subdomains: subdomains,
        dns_records: dns,
        risk_indicators: assess_dns_risk(dns, reverse, history)
      }}
    end
  end

  defp assess_dns_risk(dns, reverse, history) do
    risks = []
    risks = if reverse.domain_count > 100, do: [:high_density_hosting | risks], else: risks
    risks = if length(history) > 5, do: [:frequent_ip_changes | risks], else: risks
    risks = if missing_spf?(dns), do: [:no_spf_record | risks], else: risks
    risks
  end
end
```

## Rate Limits and Access

| Tier | Queries/Day | Features |
|------|------------|----------|
| **Free** | 250 | Web interface only, limited tools |
| **API Basic** | 1,000 | API access, all tools |
| **API Pro** | 10,000 | Priority processing, bulk queries |
| **Enterprise** | Unlimited | Dedicated support, custom integration |

### Authentication
API key required for all programmatic access. Free web interface available without registration.

## Use Cases

### Attack Surface Discovery
- Map all domains hosted on the same infrastructure as a target
- Discover shadow IT through reverse IP and reverse Whois lookups
- Track infrastructure migrations and hosting changes over time

### Threat Actor Infrastructure Analysis
- Identify co-hosted malicious domains on the same IP
- Track domain-to-IP changes to follow threat actor infrastructure pivots
- Cross-reference with [Shodan](/osint/shodan/) port data for full infrastructure profiles

### Digital Forensics
- Build historical timelines of domain infrastructure changes
- Identify registrant patterns across multiple domains
- Verify domain ownership claims against Whois records

## Related Sources

- [Censys](/osint/censys/) - Internet-wide scanning with certificate and host data
- [Shodan](/osint/shodan/) - Port scanning and service banner analysis
- [crt.sh](/osint/crtsh/) - [Certificate Transparency](/glossary/certificate-transparency/) for subdomain discovery
- [Spyse](/osint/spyse/) - DNS, certificate, and domain intelligence
- [URLScan](/osint/urlscan/) - URL-level analysis for discovered domains

## Tool Inventory

ViewDNS aggregates over 20 individual DNS and IP tools into a single interface and API:

| Tool | Description | Primary Use Case |
|------|-------------|-----------------|
| **Reverse IP** | Find all domains on an IP | Co-hosted domain discovery |
| **IP History** | Track IP address changes over time | Infrastructure timeline |
| **DNS Lookup** | Query all DNS record types | Standard DNS reconnaissance |
| **Reverse Whois** | Find domains by registrant | Entity mapping |
| **Port Scanner** | Check open ports on an IP | Service enumeration |
| **DNS Propagation** | Check DNS from global locations | Migration verification |
| **DNSBL Check** | Blocklist status for an IP | Reputation assessment |
| **Abuse Contact** | ISP abuse reporting contact | Incident response |
| **Whois Lookup** | Standard WHOIS query | Domain registration data |
| **Traceroute** | Network path analysis | Route investigation |
| **Ping** | Host availability check | Basic reachability test |
| **MAC Lookup** | MAC address vendor identification | Device manufacturer lookup |
| **HTTP Headers** | Remote HTTP header inspection | Server configuration analysis |
| **DNS Report** | Comprehensive DNS health check | DNS configuration audit |
| **Reverse NS** | Find domains using specific nameservers | Hosting provider mapping |
| **Reverse MX** | Find domains using specific mail servers | Email infrastructure mapping |

### DNS Risk Indicators

ViewDNS data enables identification of several DNS-level risk factors:

| Risk Indicator | Detection Method | Significance |
|---------------|-----------------|-------------|
| **High-density hosting** | Reverse IP shows 100+ domains | Shared hosting, attribution difficulty |
| **Frequent IP changes** | IP history shows 5+ changes/year | Possible evasion or instability |
| **Missing SPF** | DNS lookup shows no SPF TXT record | Email spoofing vulnerability |
| **Blacklisted IP** | DNSBL check returns positive | Active abuse from IP |
| **Dangling DNS** | DNS points to non-existent IP | Potential subdomain takeover |
| **Same registrant** | Reverse Whois links multiple domains | Hidden organizational connections |

## Related Platform Components

- [OSINT Core](/apps/prismatic-osint-core/) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](/apps/prismatic-perimeter/) - [EASM](/glossary/easm/) with DNS-layer discovery

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)