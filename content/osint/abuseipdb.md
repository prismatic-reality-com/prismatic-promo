+++
title = "AbuseIPDB"
weight = 10
[extra]
category = "global"
type = "ip"
module = "AbuseIpdb"
description = "Global IP address abuse reporting and reputation database"
has_api = true
url = "https://www.abuseipdb.com"
rate_limit = "1000 checks/day (free), 5000/day (basic), unlimited (premium)"
capabilities = ["IP Reputation Check", "Abuse Confidence Scoring", "Report Submission", "Bulk Checking", "CIDR Range Check", "Blacklist Export"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1542
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["AbuseIPDB", "Global", "osint", "Prismatic Platform", "Internet"]
tags = ["osint", "global", "abuseipdb", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "AbuseIPDB - Prismatic Platform"
+++

## Overview

AbuseIPDB is a globally recognized collaborative threat intelligence platform dedicated to combating the spread of malicious activity across the Internet. Founded in 2014, the project has grown from a small community-driven initiative into one of the most widely referenced IP reputation databases in the cybersecurity industry. The platform aggregates abuse reports from tens of thousands of network administrators, system operators, security researchers, and automated intrusion detection systems worldwide, creating a continuously updated repository of IP addresses associated with malicious behavior.

The fundamental premise of AbuseIPDB is crowdsourced threat intelligence: when a system administrator observes an IP address engaging in brute-force attacks, port scanning, spam delivery, DDoS participation, or other abusive behavior, they submit a report categorizing the activity. These reports are aggregated to produce an Abuse Confidence Score ranging from 0 to 100 percent, representing the statistical likelihood that the IP address is engaged in malicious activity. This score incorporates the number of distinct reporters, the recency and frequency of reports, and the diversity of abuse categories observed.

For [OSINT](/glossary/osint/) investigators and security analysts, AbuseIPDB serves as a first-line triage tool for IP address assessment. During incident response, network forensics, and [attack surface](/glossary/attack-surface/) analysis, the ability to rapidly determine whether an IP address has a documented history of abuse is invaluable. The platform's historical data retention and category-level granularity enable analysts to distinguish between opportunistic scanners, persistent attackers, compromised hosts participating in botnets, and known command-and-control infrastructure.

Within the Prismatic Platform, AbuseIPDB functions as a primary IP reputation source feeding into the [Prismatic Perimeter](/apps/prismatic-perimeter/) security rating engine and the HAWKEYE visitor intelligence system. It provides real-time threat assessment for IP addresses discovered during external attack surface mapping, visitor profiling, and network monitoring operations.

## Data Sources and Coverage

AbuseIPDB's intelligence derives from a global network of voluntary contributors spanning over 150 countries. The data coverage encompasses the entire IPv4 address space and an expanding portion of IPv6, with particular depth in regions hosting major data center and cloud infrastructure.

| Data Type | Description | Coverage |
|-----------|-------------|----------|
| **Abuse Confidence Score** | 0-100% likelihood of malicious behavior | Every reported IP |
| **Report Categories** | 22 standardized categories including DDoS, brute force, spam, port scan, web attack | Full taxonomy |
| **Report Count** | Total number of abuse reports for an IP | Historical, configurable time window |
| **Distinct Reporters** | Number of unique contributing sources | Deduplicated by reporter |
| **Country of Origin** | Geographic location via MaxMind GeoIP | IPv4 and IPv6 |
| **ISP/Organization** | Network owner and autonomous system information | WHOIS-derived |
| **Usage Type** | Commercial, residential, data center, university, etc. | Classification-based |
| **Historical Reports** | Timestamped individual abuse reports with categories and comments | Up to 365 days retention |
| **CIDR Analysis** | Aggregate abuse metrics across IP ranges | /24 minimum for IPv4 |

The 22 abuse report categories provide granular classification of observed malicious behavior, including DNS Compromise, DNS Poisoning, Fraud Orders, DDoS Attack, FTP Brute-Force, Ping of Death, Phishing, VoIP Fraud, Open Proxy, Web Spam, Email Spam, Blog Spam, VPN IP, Port Scan, Hacking, SQL Injection, Spoofing, Brute-Force, Bad Web Bot, Exploited Host, Web App Attack, SSH, and IoT Targeted. This taxonomy enables precise filtering and correlation when building threat profiles.

## Technical Architecture

AbuseIPDB operates a REST API architecture with JSON response formatting, accessible at the `https://api.abuseipdb.com/api/v2/` base endpoint. The API follows standard HTTP conventions with GET requests for queries and POST requests for report submissions.

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/check` | GET | Check abuse confidence score for a single IP |
| `/reports` | GET | Get individual reports for an IP address |
| `/blacklist` | GET | Export high-confidence abusive IP blacklist |
| `/report` | POST | Submit an abuse report for an IP |
| `/check-block` | GET | Check abuse data for a CIDR range |
| `/bulk-report` | POST | Submit multiple reports via CSV upload |
| `/clear-address` | DELETE | Remove reports for an IP you own |

All requests require authentication via an API key passed in the `Key` HTTP header. Responses include standard HTTP status codes, with rate limit information conveyed through `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers.

The check endpoint accepts parameters for `maxAgeInDays` (1-365, default 30), `verbose` (boolean, includes individual reports), and returns the aggregate abuse confidence score along with metadata including ISP, usage type, domain, country code, and total reports. The blacklist endpoint supports filtering by `confidenceMinimum` (25-100) and returns a sorted list of the most abusive IP addresses globally.

## API Integration

The Prismatic Platform integrates AbuseIPDB through a dedicated adapter module that implements the standard OSINT provider interface with connection pooling, automatic retry logic, and response caching.

```elixir
defmodule PrismaticOsint.Providers.AbuseIpdb do
  @moduledoc """
  AbuseIPDB integration for IP reputation checking and abuse reporting.
  Implements the PrismaticOsint.Provider behaviour with rate-limiting
  and response caching.
  """

  @behaviour PrismaticOsint.Provider

  @base_url "https://api.abuseipdb.com/api/v2"

  @spec check(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  @doc """
  Check the abuse confidence score for a given IP address.
  Options: max_age_in_days (1-365), verbose (boolean).
  """
  def check(ip_address, opts \\ []) do
    params = %{
      ipAddress: ip_address,
      maxAgeInDays: Keyword.get(opts, :max_age_in_days, 90),
      verbose: Keyword.get(opts, :verbose, false)
    }

    get("/check", params)
  end

  @spec check_cidr(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  @doc "Check abuse data for a CIDR range (minimum /24)."
  def check_cidr(network, opts \\ []) do
    params = %{
      network: network,
      maxAgeInDays: Keyword.get(opts, :max_age_in_days, 30)
    }

    get("/check-block", params)
  end

  @spec report(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  @doc "Submit an abuse report for a malicious IP address."
  def report(ip_address, opts) do
    body = %{
      ip: ip_address,
      categories: Keyword.fetch!(opts, :categories) |> Enum.join(","),
      comment: Keyword.get(opts, :comment, "")
    }

    post("/report", body)
  end

  @spec blacklist(keyword()) :: {:ok, list(map())} | {:error, term()}
  @doc "Export blacklist of high-confidence abusive IPs."
  def blacklist(opts \\ []) do
    params = %{
      confidenceMinimum: Keyword.get(opts, :confidence_minimum, 90),
      limit: Keyword.get(opts, :limit, 10_000)
    }

    get("/blacklist", params)
  end
end
```

### Pipeline Integration

AbuseIPDB feeds into the Prismatic Perimeter security rating pipeline and the HAWKEYE visitor intelligence system for real-time threat assessment during attack surface enumeration.

```elixir
defmodule PrismaticPerimeter.Enrichment.IpReputation do
  @moduledoc """
  Enriches IP intelligence by combining AbuseIPDB reputation data
  with Shodan service discovery for comprehensive threat context.
  """

  @spec enrich_ip(String.t()) :: {:ok, map()} | {:error, term()}
  def enrich_ip(ip_address) do
    tasks = [
      Task.async(fn -> PrismaticOsint.Providers.AbuseIpdb.check(ip_address) end),
      Task.async(fn -> PrismaticOsint.Providers.Shodan.host(ip_address) end),
      Task.async(fn -> PrismaticOsint.Providers.GreyNoise.quick(ip_address) end)
    ]

    [abuse_report, shodan_host, greynoise] = Task.await_many(tasks, 15_000)

    {:ok, merge_intelligence(abuse_report, shodan_host, greynoise)}
  end
end
```

## Use Cases

### Perimeter Security and Attack Surface Management

AbuseIPDB is integral to external attack surface management workflows. During automated asset discovery, every IP address identified as part of an organization's external perimeter is checked against the AbuseIPDB database. IP addresses with high abuse confidence scores that appear within an organization's address space may indicate compromised hosts, misconfigured services, or infrastructure being leveraged for malicious purposes. This intelligence directly feeds into the Prismatic Perimeter security rating calculation, where the presence of abusive IPs within an organization's network range negatively impacts the overall security posture score.

### Incident Response and Forensic Triage

During security incidents, analysts must rapidly triage large volumes of IP addresses extracted from logs, network captures, and intrusion detection alerts. AbuseIPDB enables immediate classification of these IPs into categories: known malicious actors, opportunistic scanners, benign services, and previously unreported addresses. The category-level detail allows responders to prioritize investigation efforts and correlate observed behavior with community-reported patterns. Integration with [VirusTotal](/osint/virustotal/) and [GreyNoise](/osint/greynoise/) provides comprehensive threat context.

### Dynamic Blocklist Generation

Organizations can leverage the AbuseIPDB blacklist endpoint to generate dynamic firewall rules and network access control lists. By exporting IP addresses above a configurable confidence threshold, security teams can automatically block known malicious sources at the network perimeter. The Prismatic Platform automates this workflow, refreshing blocklists at configurable intervals and distributing them across managed security infrastructure.

### Network Abuse Monitoring

Network operators and hosting providers use AbuseIPDB to monitor their own IP ranges for abuse reports. The CIDR range check endpoint enables automated surveillance of owned address space, flagging IP addresses that have received external abuse reports. This proactive monitoring helps operators identify compromised customer accounts, misconfigured services, and other abuse sources before they escalate into reputational damage.

## Data Quality and Reliability

AbuseIPDB's crowdsourced model introduces both strengths and limitations that must be understood for reliable intelligence production.

**Strengths**: The diversity of reporters provides natural signal plurality, as reports from multiple independent sources carry significantly more weight than single-source claims. The confidence scoring algorithm incorporates temporal decay, ensuring that stale reports lose influence over time. The 22-category taxonomy provides sufficient granularity for meaningful analysis without overwhelming complexity.

**Limitations**: As a voluntary reporting system, AbuseIPDB coverage is inherently biased toward networks and services monitored by technically sophisticated operators. Residential ISPs and smaller organizations are underrepresented as reporters. False positive rates exist, particularly for shared infrastructure such as NAT gateways, CDN exit nodes, and Tor exit relays where legitimate and malicious traffic may originate from the same IP. The platform does not verify the accuracy of individual reports beyond basic validation.

**Mitigation**: Within the Prismatic Platform, AbuseIPDB data is always correlated with at least two additional intelligence sources before informing automated decisions. The NABLA signal plurality axiom mandates that no single reputation source determines an IP's classification.

## Platform Integration

AbuseIPDB integrates with the Prismatic Platform at multiple architectural layers:

| Integration Point | Description | Component |
|-------------------|-------------|-----------|
| **Perimeter EASM** | IP reputation enrichment during asset discovery | `PrismaticPerimeter.Discovery` |
| **Security Rating** | Abuse metrics factor into organizational security scores | `PrismaticPerimeter.Rating` |
| **HAWKEYE** | Real-time visitor IP threat assessment | `PrismaticVisitorIntelligence` |
| **Threat Feed** | Blacklist ingestion for dynamic blocklist generation | `PrismaticOsint.Feeds` |
| **Incident Response** | IP triage during security incident workflows | `PrismaticOsint.Investigation` |

The adapter implements the `PrismaticOsint.Provider` behaviour, ensuring consistent error handling, telemetry emission, and circuit breaker patterns across all OSINT integrations. Response data is normalized into the platform's unified intelligence schema before downstream consumption.

## NABLA Compliance

AbuseIPDB integration adheres to the NABLA infinity epistemic framework through the following mechanisms:

| Axiom | Implementation |
|-------|----------------|
| **Signal Plurality** | AbuseIPDB data is never used in isolation; always correlated with Shodan, GreyNoise, and VirusTotal |
| **Contradiction Preservation** | Disagreements between AbuseIPDB and other sources are preserved and flagged for analyst review |
| **Time Decay** | The `maxAgeInDays` parameter enforces temporal relevance; stale reports are weighted lower |
| **Source Independence** | AbuseIPDB's crowdsourced model provides independent signal from scan-based sources like Shodan |
| **Provenance Mandatory** | Every reputation assessment includes source attribution with timestamps and confidence levels |
| **Unknown Valid** | IPs with no AbuseIPDB reports are classified as "unknown" rather than "clean" |

## Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| **API Response Time** | 100-300ms typical | Single IP check |
| **Blacklist Export** | 2-5 seconds | Up to 500,000 IPs |
| **CIDR Range Check** | 500ms-2s | Depends on range size |
| **Data Freshness** | Near real-time | Reports appear within minutes |
| **Database Size** | 100M+ reports | Continuously growing |
| **Global Reporters** | 50,000+ | Across 150+ countries |

### Rate Limits by Tier

| Tier | Daily Checks | Reports/Day | Blacklist Access | Bulk Check |
|------|-------------|-------------|-----------------|------------|
| **Free** | 1,000 | 500 | 10,000 IPs | No |
| **Basic** | 5,000 | 1,000 | 50,000 IPs | Yes |
| **Premium** | 50,000 | 5,000 | 500,000 IPs | Yes |
| **Enterprise** | Unlimited | Unlimited | Full list | Yes |

## Related Resources

- [Shodan](/osint/shodan/) - Internet-wide device scanning with port and banner data for service-level correlation
- [VirusTotal](/osint/virustotal/) - Multi-engine malware and URL scanning for comprehensive threat context
- [GreyNoise](/osint/greynoise/) - Internet noise analysis distinguishing benign scanners from targeted attacks
- [Censys](/osint/censys/) - Internet-wide scanning with certificate intelligence for infrastructure mapping
- [URLScan](/osint/urlscan/) - URL analysis with screenshot and DOM capture for web threat verification
- [BinaryEdge](/osint/binaryedge/) - Supplementary internet scanning with data leak detection capabilities

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)