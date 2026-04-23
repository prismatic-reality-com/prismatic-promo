+++
title = "URLhaus"
weight = 40
[extra]
category = "global"
type = "threat"
module = "Urlhaus"
description = "Community-driven malicious URL database operated by abuse.ch for tracking malware distribution sites"
has_api = true
url = "https://urlhaus.abuse.ch"
rate_limit = "No official limit, recommended 1 req/sec"
capabilities = ["Malicious URL Lookup", "Payload Download Tracking", "Malware Family Tagging", "Bulk Export", "URL Submission", "Host Intelligence", "Tag-Based Search"]
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
word_count = 633
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["URLhaus", "Community-driven", "osint", "global", "Prismatic Platform", "URLs", "Emotet", "QakBot"]
tags = ["osint", "global", "urlhaus", "prismatic"]
quality_score = 65
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "URLhaus - Prismatic Platform"
+++

## Overview

URLhaus is a project from abuse.ch, a non-profit organization focused on combating malware and botnets. The platform collects, tracks, and shares malicious URLs that are being used for malware distribution. With over 2.5 million malicious URLs tracked since its inception, URLhaus serves as one of the most comprehensive open databases of active malware distribution infrastructure on the Internet.

URLhaus relies on a global community of security researchers who submit URLs observed distributing malware. Each submission is tagged with the associated malware family (e.g., Emotet, QakBot, IcedID), enabling precise [threat intelligence](@/glossary/threat-intelligence.md). The database is updated in near real-time, with most submissions appearing within minutes of discovery.

The project also tracks the hosting infrastructure behind malicious URLs, identifying abuse-tolerant hosting providers, compromised legitimate sites, and dedicated malware distribution servers. This hosting intelligence is invaluable for understanding the supply chain of cybercrime infrastructure.

## Data Coverage

| Data Type | Description |
|-----------|-------------|
| **Malicious URLs** | Full URLs used for malware distribution, phishing, or C2 |
| **Malware Families** | Tagged malware families (Emotet, QakBot, AsyncRAT, etc.) |
| **Payloads** | SHA256 hashes of distributed malware payloads |
| **Hosting Information** | IP addresses, ASNs, and hosting providers |
| **URL Status** | Online/offline status with last-checked timestamps |
| **Threat Type** | malware_download, phishing, or command_and_control |
| **Reporter** | Submitting researcher or organization |
| **Tags** | Community-assigned tags for classification |

### Malware Distribution Tracking

```
Researcher discovers malicious URL
    |
    v
Submission to URLhaus with malware family tag
    |
    v
URLhaus validates and indexes the URL
    |
    v
Prismatic queries for domain/IP correlation
    |
    v
Cross-reference with VirusTotal, AbuseIPDB, Shodan
```

## Integration with Prismatic

URLhaus feeds into the Prismatic threat intelligence pipeline, providing malware distribution intelligence for the [Prismatic Perimeter](@/apps/prismatic-perimeter.md) [security rating](@/glossary/security-rating.md) engine and the [OSINT Core](@/apps/prismatic-osint-core.md) aggregation framework.

```elixir
# Search by URL
{:ok, result} = Urlhaus.search_url("https://evil-domain.com/payload.exe")
# => %{
#   id: 123456,
#   url: "https://evil-domain.com/payload.exe",
#   url_status: "online",
#   threat: "malware_download",
#   tags: ["Emotet", "epoch5"],
#   host: "evil-domain.com",
#   date_added: ~U[2025-12-01 14:30:00Z],
#   last_online: ~U[2025-12-15 09:00:00Z],
#   payloads: [
#     %{sha256: "abc123...", filename: "payload.exe", file_type: "exe",
#       signature: "Emotet", virustotal_percent: 68.5}
#   ]
# }

# Search by host (domain or IP)
{:ok, results} = Urlhaus.search_host("evil-domain.com")

# Search by malware payload hash
{:ok, payload} = Urlhaus.search_payload(sha256: "abc123def456...")

# Get recent additions (last 24 hours)
{:ok, recent} = Urlhaus.recent(limit: 100)

# Search by tag/malware family
{:ok, emotet_urls} = Urlhaus.search_tag("Emotet")

# Bulk export for threat feed integration
{:ok, feed} = Urlhaus.export(format: :csv, filter: :online_only)

# Submit a malicious URL
{:ok, _} = Urlhaus.submit("https://malicious-site.com/dropper.js",
  threat: :malware_download,
  tags: ["AsyncRAT"]
)
```

### Threat Feed Pipeline

```elixir
defmodule PrismaticPerimeter.Feeds.MalwareUrlFeed do
  @moduledoc """
  Integrates URLhaus malware distribution data into the
  Perimeter threat intelligence pipeline.
  """

  def check_domain_for_malware(domain) do
    with {:ok, urlhaus_data} <- Urlhaus.search_host(domain),
         {:ok, vt_report} <- VirusTotal.domain_report(domain),
         {:ok, urlscan_data} <- Urlscan.search("domain:#{domain}") do
      {:ok, %{
        domain: domain,
        malware_urls: length(urlhaus_data.urls),
        active_threats: Enum.count(urlhaus_data.urls, &(&1.url_status == "online")),
        malware_families: extract_families(urlhaus_data),
        vt_detections: vt_report.positives,
        risk_score: calculate_malware_risk(urlhaus_data, vt_report),
        recommendation: determine_action(urlhaus_data)
      }}
    end
  end

  defp calculate_malware_risk(urlhaus_data, vt_report) do
    active_count = Enum.count(urlhaus_data.urls, &(&1.url_status == "online"))

    cond do
      active_count > 5 -> :critical
      active_count > 0 -> :high
      length(urlhaus_data.urls) > 10 -> :medium
      true -> :low
    end
  end
end
```

## Rate Limits and Access

| Aspect | Details |
|--------|---------|
| **Authentication** | None required for lookups; API key for submissions |
| **Rate Limit** | No official limit, 1 req/sec recommended |
| **Data Formats** | JSON API, CSV bulk export, plaintext feeds |
| **Update Frequency** | Near real-time (minutes after submission) |
| **Cost** | Completely free (community-driven) |
| **Bulk Feeds** | Full database export available as CSV |

### Feed Formats
- **Recent URLs**: Last 30 days of additions (JSON/CSV)
- **Online URLs**: Currently active malicious URLs only
- **Payloads**: Recent malware payload hashes
- **Full Database**: Complete historical export

## Use Cases

### Threat Intelligence
- Identify domains and IPs associated with active malware campaigns
- Track malware family infrastructure evolution over time
- Feed real-time IOCs into [SIEM](@/glossary/siem.md) and firewall blocklists
- Cross-correlate with [VirusTotal](@/osint/virustotal.md) detections

### Domain Reputation
- Check if a domain has ever hosted malware distribution URLs
- Assess hosting provider reputation based on abuse volume
- Feed domain [risk score](@/glossary/risk-score.md)s into [Prismatic Perimeter](@/apps/prismatic-perimeter.md) ratings

### Incident Response
- Rapidly identify malware family from observed URL patterns
- Trace distribution infrastructure to hosting providers
- Correlate payloads with known threat actor campaigns

## Related Sources

- [VirusTotal](@/osint/virustotal.md) - Multi-engine malware scanning and URL analysis
- [URLScan](@/osint/urlscan.md) - Visual URL analysis with DOM and network capture
- [AbuseIPDB](@/osint/abuseipdb.md) - IP reputation for malware hosting infrastructure
- [Shodan](@/osint/shodan.md) - Infrastructure scanning for distribution servers
- [GreyNoise](@/osint/greynoise.md) - Background noise filtering for malware scanner IPs

## Malware Family Tracking

URLhaus tracks active malware distribution campaigns by family, providing intelligence on the most prevalent threats:

| Malware Family | Type | Distribution Method | Typical Payload |
|---------------|------|-------------------|----------------|
| **Emotet** | Loader/Botnet | Phishing emails, Office macros | DLL, EXE |
| **QakBot** | Banking Trojan | Email thread hijacking | MSI, ZIP |
| **IcedID** | Banking Trojan | Fake invoice emails | ISO, LNK |
| **AsyncRAT** | Remote Access Trojan | Phishing, drive-by download | EXE, VBS |
| **Cobalt Strike** | C2 Framework | Exploit kits, phishing | DLL beacon |
| **RedLine** | Stealer | Cracked software, SEO poisoning | EXE |
| **Remcos** | RAT | Business email compromise | EXE, DOCX |

Tracking malware families through their distribution URLs enables correlation with [threat intelligence](@/glossary/threat-intelligence.md) from other sources and provides early warning when campaigns target specific industries or geographies.

### Hosting Infrastructure Analysis

URLhaus data reveals patterns in how threat actors use hosting infrastructure:

| Infrastructure Type | Description | Typical Takedown Time |
|-------------------|-------------|---------------------|
| **Compromised Sites** | Legitimate websites exploited for hosting | Hours to days |
| **Bulletproof Hosting** | Abuse-tolerant providers | Days to weeks |
| **Cloud Storage** | Abusing legitimate cloud services | Hours |
| **Fast-Flux** | Rapidly rotating infrastructure | Continuous |

## Related Platform Components

- [OSINT Core](@/apps/prismatic-osint-core.md) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](@/apps/prismatic-perimeter.md) - [EASM](@/glossary/easm.md) with threat feed integration

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)