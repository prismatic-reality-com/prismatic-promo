+++
title = "GreyNoise"
weight = 13
[extra]
category = "global"
type = "ip"
module = "GreyNoise"
description = "Internet noise analysis platform distinguishing targeted attacks from background scanning"
has_api = true
url = "https://www.greynoise.io"
rate_limit = "50 req/day (community), 5000 req/day (paid)"
capabilities = ["IP Context", "Noise Classification", "RIOT Dataset", "Mass Scanner Detection", "Tag-Based Search", "CVE Exploitation Tracking"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 817
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["GreyNoise", "Internet", "osint", "global", "Prismatic Platform", "RIOT", "Mirai"]
tags = ["osint", "global", "greynoise", "prismatic"]
quality_score = 75
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "GreyNoise - Prismatic Platform"
+++

## Overview

GreyNoise collects, analyzes, and labels data on IPs that scan and attack the Internet. It operates a global network of passive sensors (honeypots) that observe unsolicited Internet traffic, distinguishing between background noise (mass scanners, search engines, worms) and targeted attacks.

This distinction is critical for security operations: when a SOC analyst sees an IP in their logs, GreyNoise answers the question "Is this IP scanning the entire Internet, or specifically targeting me?" This dramatically reduces alert fatigue and helps focus investigation on genuine threats. Research by GreyNoise indicates that up to 80% of alerts in a typical SOC environment are triggered by background Internet noise rather than targeted attacks -- filtering this noise fundamentally changes the analyst workload.

The platform maintains behavioral profiles for millions of IP addresses, tagging them with descriptive labels (e.g., "Mirai", "SSH Bruteforcer", "Struts Scanner") that indicate the type of activity observed. This behavioral tagging, combined with the noise/targeted classification, creates an intelligence layer that no other single source provides.

## Data Coverage

| Data Type | Description |
|-----------|-------------|
| **Noise Classification** | Mass scanner, benign service, malicious, unknown |
| **RIOT (Rule It Out)** | Known benign services (CDNs, DNS, SaaS) |
| **Tags** | Behavioral tags (e.g., "Mirai", "SSH Bruteforcer", "Struts Scanner") |
| **[CVE](/glossary/cve/) Tracking** | IPs actively exploiting specific CVEs |
| **Metadata** | ASN, organization, OS, ports, protocols |
| **Timeline** | First/last seen timestamps, activity patterns |
| **Sensor Coverage** | Global honeypot network visibility |
| **Raw Data** | Packet-level data from sensor observations |

### Classification Model

GreyNoise classifies every observed IP into one of these categories:

| Classification | Meaning | Action Guidance |
|---------------|---------|-----------------|
| **benign** | Known legitimate scanner ([Shodan](/osint/shodan/), [Censys](/osint/censys/), search engines) | Safe to suppress alerts |
| **malicious** | Actively attacking (exploiting vulnerabilities, brute forcing) | Investigate if targeted |
| **unknown** | Scanning but intent unclear | Monitor and correlate |
| **RIOT** | Known benign service IP (not a scanner) | Safe to allow |

### RIOT Dataset

The Rule It Out (RIOT) dataset is a curated collection of IP addresses belonging to known legitimate services. Unlike the noise classification which identifies scanners, RIOT identifies service IPs that appear in logs because of legitimate business operations:

| RIOT Category | Examples | Typical Log Appearance |
|--------------|---------|----------------------|
| **CDN** | Cloudflare, Akamai, Fastly | Web server access logs |
| **DNS** | Google DNS, Cloudflare DNS | DNS query logs |
| **SaaS** | Microsoft 365, Salesforce, Slack | Outbound connection logs |
| **Cloud** | AWS, GCP, Azure service IPs | Network flow data |
| **Security** | CrowdStrike, Zscaler | Endpoint and proxy logs |

## Integration with Prismatic

GreyNoise is integrated into the Prismatic [threat intelligence](/glossary/threat-intelligence/) pipeline, feeding into both the [HAWKEYE](/apps/prismatic-hawkeye/) visitor intelligence system and the [Prismatic Perimeter](/apps/prismatic-perimeter/) [security rating](/glossary/security-rating/) engine.

```elixir
# Quick IP classification
{:ok, classification} = GreyNoise.quick("1.2.3.4")
# => %{
#   ip: "1.2.3.4",
#   noise: true,
#   riot: false,
#   classification: "malicious",
#   name: "unknown",
#   link: "https://viz.greynoise.io/ip/1.2.3.4"
# }

# Full IP context with tags and metadata
{:ok, context} = GreyNoise.context("1.2.3.4")
# => %{
#   ip: "1.2.3.4",
#   seen: true,
#   classification: "malicious",
#   tags: ["Mirai", "SSH Bruteforcer"],
#   first_seen: "2024-01-15",
#   last_seen: "2024-03-20",
#   metadata: %{asn: "AS4134", city: "Beijing", country: "China", os: "Linux"},
#   cve: ["CVE-2021-44228"],
#   raw_data: %{scan: [%{port: 22, protocol: "TCP"}], web: %{}}
# }

# Check RIOT dataset (known benign services)
{:ok, riot} = GreyNoise.riot("8.8.8.8")
# => %{ip: "8.8.8.8", riot: true, name: "Google DNS", category: "dns"}

# Search by tag
{:ok, results} = GreyNoise.search("tags:\"Mirai\" classification:malicious last_seen:1w")

# Get IPs exploiting a specific CVE
{:ok, exploiters} = GreyNoise.search("cve:CVE-2021-44228")

# Bulk IP lookup
{:ok, bulk} = GreyNoise.multi(["1.2.3.4", "5.6.7.8", "9.10.11.12"])
```

### Alert Triage Pipeline

The alert triage pipeline leverages GreyNoise to automatically classify incoming security alerts, dramatically reducing the volume of alerts requiring human analysis.

```elixir
defmodule PrismaticPerimeter.Triage.NoiseFilter do
  @moduledoc """
  Filters security alerts using GreyNoise to remove background noise.
  Reduces false positives by 60-80% in typical environments.
  """

  def triage_alert(alert) do
    with {:ok, context} <- GreyNoise.context(alert.source_ip) do
      case context.classification do
        "benign" ->
          {:ok, :suppress, "Known benign scanner: #{context.name}"}

        "malicious" when context.noise == true ->
          {:ok, :lower_priority, "Mass scanner, not targeted"}

        "malicious" when context.noise == false ->
          {:ok, :escalate, "Targeted attack from known malicious IP"}

        _ ->
          {:ok, :investigate, "Unknown classification, manual review needed"}
      end
    end
  end
end
```

### CVE Exploitation Monitoring

GreyNoise provides unique intelligence on active CVE exploitation campaigns. The platform tracks which CVEs are being actively exploited in the wild and by how many distinct IP addresses, providing a real-world measure of exploitation prevalence:

```elixir
defmodule PrismaticPerimeter.Intelligence.ExploitMonitor do
  @moduledoc """
  Monitors CVE exploitation trends using GreyNoise sensor data
  to prioritize patching based on real-world exploitation evidence.
  """

  def exploitation_report(cve_list) do
    cve_list
    |> Enum.map(fn cve ->
      case GreyNoise.search("cve:#{cve}") do
        {:ok, %{count: count, ips: ips}} ->
          %{cve: cve, active_exploiters: count,
            top_countries: extract_countries(ips),
            exploitation_trend: calculate_trend(cve)}
        {:error, _} ->
          %{cve: cve, active_exploiters: 0}
      end
    end)
    |> Enum.sort_by(& &1.active_exploiters, :desc)
  end
end
```

## GNQL Query Language

GreyNoise provides a powerful query language (GNQL) for advanced searches across the sensor dataset:

| Query | Description |
|-------|-------------|
| `classification:malicious` | All malicious IPs |
| `tags:"Mirai"` | IPs tagged as Mirai botnet |
| `cve:CVE-2021-44228` | IPs exploiting Log4Shell |
| `metadata.asn:AS4134` | IPs in specific ASN |
| `metadata.country:CN` | IPs from specific country |
| `last_seen:1w` | Active in the last week |
| `raw_data.scan.port:22` | Scanning SSH port |
| `classification:malicious tags:"SSH Bruteforcer"` | Malicious SSH brute forcers |

## Rate Limits and Access

| Tier | Queries/Day | Features |
|------|------------|----------|
| **Community** | 50 | Quick/RIOT lookup only |
| **Starter** | 5,000 | Full context, tags, GNQL search |
| **Business** | 25,000 | Bulk API, integrations, alerts |
| **Enterprise** | Unlimited | Real-time feed, custom sensors |

### Authentication
API key required for all tiers. Community tier available with free registration.

### Integration Patterns

| Pattern | Description | Use Case |
|---------|-------------|----------|
| **Real-time enrichment** | Enrich every alert IP on arrival | SOC triage automation |
| **Batch enrichment** | Periodic bulk lookup of log IPs | Daily threat report |
| **SIEM integration** | Direct feed into Splunk, Elastic, etc. | Inline alert enrichment |
| **Firewall feed** | Block/allow based on classification | Automated defense |

## Use Cases

### SOC Alert Reduction
- Filter background noise from security alerts
- Reduce false positive investigation time by 60-80%
- Focus analyst attention on genuinely targeted attacks
- Automate disposition of known benign scanner alerts

### Threat Intelligence
- Track mass exploitation campaigns (Log4Shell, MOVEit, etc.)
- Identify scanning infrastructure operated by threat actors
- Correlate with [AbuseIPDB](/osint/abuseipdb/) for abuse context
- Monitor CVE exploitation velocity for patch prioritization

### Attack Surface Monitoring
- Identify which scanners are probing your infrastructure
- Distinguish [Shodan](/osint/shodan/)/[Censys](/osint/censys/) scans from malicious reconnaissance
- Feed intelligence into [Perimeter](/apps/prismatic-perimeter/) security ratings
- Track scanning trends against organizational IP space over time

### Incident Response
- Rapidly determine if an attacking IP is part of a mass campaign or targeted operation
- Identify related infrastructure through shared behavioral tags
- Build timeline of attacker scanning activity from sensor data
- Correlate with [IPinfo](/osint/ipinfo/) for geographic and organizational attribution

## Related Sources

- [AbuseIPDB](/osint/abuseipdb/) - Community-driven IP abuse reporting
- [Shodan](/osint/shodan/) - Internet device search and port scanning
- [Censys](/osint/censys/) - Internet-wide scanning and certificate intelligence
- [VirusTotal](/osint/virustotal/) - Multi-engine threat analysis
- [URLScan](/osint/urlscan/) - URL-level threat analysis
- [IPinfo](/osint/ipinfo/) - IP geolocation and ASN intelligence
- [IPQualityScore](/osint/ipqualityscore/) - Fraud scoring and proxy detection

## Related Platform Components

- [OSINT Core](/apps/prismatic-osint-core/) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](/apps/prismatic-perimeter/) - Noise-filtered [EASM](/glossary/easm/) intelligence
- [HAWKEYE](/apps/prismatic-hawkeye/) - Visitor intelligence with noise classification

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)