+++
title = "URLScan"
weight = 14
[extra]
category = "global"
type = "threat"
module = "Urlscan"
description = "URL scanning service with visual screenshots, DOM analysis, and threat detection"
has_api = true
url = "https://urlscan.io"
rate_limit = "100 scans/day (free), 5000/day (paid), 100 results/search (free)"
capabilities = ["URL Scanning", "Screenshot Capture", "DOM Analysis", "Resource Tracking", "Phishing Detection", "Certificate Analysis", "Technology Detection"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1094
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["URLScan", "scanning", "service", "visual", "screenshots", "analysis", "threat", "osint", "global", "Prismatic Platform"]
tags = ["osint", "global", "urlscan", "prismatic"]
quality_score = 75
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "URLScan - Prismatic Platform"
+++

## Overview

URLScan.io is a free service to scan and analyze websites. When a URL is submitted, URLScan visits the page with a real browser, captures a full-page screenshot, records all HTTP transactions, identifies technologies, extracts links and forms, and analyzes the page for indicators of malicious activity. The service provides a comprehensive forensic snapshot of any web page at a given point in time, preserving evidence that may be altered or removed by threat actors.

The platform was created by Johannes Gilger and has become one of the most widely used URL analysis tools in the security community. SOC analysts, threat researchers, and security teams rely on URLScan for rapid URL triage, phishing investigation, and web-based threat analysis. Its ability to safely render potentially malicious pages in a sandboxed environment eliminates the risk of analyst exposure to drive-by downloads, exploit kits, or credential harvesting forms.

URLScan's community-driven approach creates a growing database of scanned URLs that serves as a collective intelligence resource. Public scans are searchable by other users, enabling threat hunters to discover patterns across phishing campaigns, track malware distribution infrastructure, and identify brand impersonation at scale. The platform's search API supports complex queries that combine domain, IP, server, title, and content attributes.

Within the Prismatic Platform, URLScan serves as a key component in the threat analysis pipeline, particularly for phishing detection and web threat assessment within the [HAWKEYE](@/apps/prismatic-hawkeye.md) visitor intelligence system and the [Prismatic Perimeter](@/apps/prismatic-perimeter.md) [EASM](@/glossary/easm.md) module.

## Data Coverage

| Data Type | Description |
|-----------|-------------|
| **Screenshots** | Full-page visual capture of the rendered page |
| **DOM** | Complete Document Object Model after JavaScript execution |
| **HTTP Transactions** | All requests/responses including headers and cookies |
| **Certificates** | [TLS](@/glossary/tls.md) certificate chain analysis |
| **Technologies** | CMS, frameworks, analytics, CDNs detected |
| **Links** | All extracted URLs, forms, and redirects |
| **IPs & ASNs** | Server infrastructure intelligence |
| **Verdicts** | Malicious, suspicious, or clean classification |
| **Similar Pages** | Visually or structurally similar scans |
| **Console Output** | JavaScript console messages and errors |
| **Cookies** | All cookies set during page rendering |
| **Global Variables** | JavaScript global variables detected |

### Scan Visibility Levels

URLScan supports three visibility levels that control how scan results are shared:

| Level | Description | Use Case |
|-------|-------------|----------|
| **Public** | Visible to everyone, indexed, searchable | Threat intelligence sharing |
| **Unlisted** | Accessible by URL only, not indexed | Investigation without disclosure |
| **Private** | Only visible to the submitter (paid feature) | Sensitive investigations |

### Scan Processing Pipeline

```
URL Submitted via API or Web Interface
    |
    v
Chromium-based browser navigates to URL
    |
    v
Full page rendering with JavaScript execution
    |
    v
Parallel capture: screenshot, DOM, HTTP transactions, certificates
    |
    v
Analysis: technology detection, verdict classification, similarity matching
    |
    v
Results available via API and web interface (~30 seconds)
```

## Integration with Prismatic

URLScan integrates with the Prismatic platform for automated URL analysis, phishing detection, and web threat intelligence collection.

```elixir
# Submit a URL for scanning
{:ok, submission} = Urlscan.scan("https://suspicious-site.example.com",
  visibility: "unlisted",
  tags: ["phishing-investigation"]
)
# => %{uuid: "abc123", api_url: "...", visibility: "unlisted"}

# Get scan results (poll until complete)
{:ok, result} = Urlscan.result(submission.uuid)
# => %{
#   task: %{url: "https://suspicious-site.example.com", time: "2024-03-20T10:15:00Z"},
#   page: %{
#     url: "https://suspicious-site.example.com",
#     domain: "suspicious-site.example.com",
#     ip: "1.2.3.4",
#     server: "nginx",
#     tlsIssuer: "Let's Encrypt",
#     title: "Login - Example Corp"
#   },
#   verdicts: %{malicious: true, score: 85, categories: ["phishing"]},
#   stats: %{requests: 42, ips: 8, domains: 5},
#   screenshot: "https://urlscan.io/screenshots/abc123.png"
# }

# Search existing scans
{:ok, results} = Urlscan.search("domain:example.com AND page.title:\"Login\"")

# Get screenshot
{:ok, screenshot_url} = Urlscan.screenshot(submission.uuid)

# Get DOM content
{:ok, dom} = Urlscan.dom(submission.uuid)

# Search for similar pages (visual similarity)
{:ok, similar} = Urlscan.similar(submission.uuid)

# Get HTTP transaction details
{:ok, transactions} = Urlscan.http_transactions(submission.uuid)

# Bulk scan multiple URLs
{:ok, batch} = Urlscan.batch_scan([
  "https://site1.example.com",
  "https://site2.example.com"
], visibility: "unlisted")
```

### Phishing Detection Pipeline

The phishing detection pipeline combines URLScan visual analysis with cross-source intelligence from [VirusTotal](@/osint/virustotal.md) and [PhishTank](@/osint/phishtank.md) for comprehensive threat assessment.

```elixir
defmodule PrismaticPerimeter.Detection.PhishingAnalyzer do
  @moduledoc """
  Analyzes URLs for phishing indicators using URLScan combined
  with VirusTotal and PhishTank for multi-source verification.
  """

  def analyze_url(url) do
    with {:ok, scan} <- Urlscan.scan(url, visibility: "unlisted"),
         {:ok, result} <- poll_for_result(scan.uuid),
         {:ok, vt_report} <- VirusTotal.url_report(url),
         {:ok, phishtank} <- PhishTank.check(url) do
      {:ok, %{
        url: url,
        is_phishing: result.verdicts.malicious,
        urlscan_score: result.verdicts.score,
        vt_detections: vt_report.positives,
        phishtank_verified: phishtank.verified,
        screenshot: result.screenshot,
        technologies: result.page.technologies,
        certificate_age: calculate_cert_age(result.page.tlsIssuer),
        redirect_chain: extract_redirects(result),
        brand_targeted: detect_brand_impersonation(result),
        risk_assessment: composite_risk(result, vt_report, phishtank)
      }}
    end
  end

  defp detect_brand_impersonation(result) do
    known_brands = load_brand_signatures()
    dom_content = result.dom || ""
    page_title = result.page.title || ""

    Enum.find(known_brands, fn brand ->
      String.contains?(dom_content, brand.signatures) or
      String.contains?(page_title, brand.name)
    end)
  end
end
```

### Brand Protection Monitoring

URLScan enables automated brand protection by searching for pages that impersonate organizational brands:

```elixir
defmodule PrismaticPerimeter.BrandProtection.MonitoringService do
  @moduledoc """
  Monitors URLScan results for brand impersonation and
  unauthorized use of organizational assets.
  """

  def monitor_brand(brand_name, domain) do
    queries = [
      "page.title:\"#{brand_name}\" AND NOT domain:#{domain}",
      "page.domain:*#{brand_name}* AND NOT domain:#{domain}",
      "page.url:*login* AND page.title:\"#{brand_name}\""
    ]

    results =
      queries
      |> Enum.flat_map(fn query ->
        case Urlscan.search(query) do
          {:ok, %{results: hits}} -> hits
          _ -> []
        end
      end)
      |> Enum.uniq_by(& &1.page.domain)

    {:ok, %{
      brand: brand_name,
      impersonation_candidates: length(results),
      domains: Enum.map(results, & &1.page.domain),
      screenshots: Enum.map(results, & &1.screenshot),
      action_required: length(results) > 0
    }}
  end
end
```

## Scan Result Analysis

URLScan results provide rich intelligence across multiple analysis dimensions that feed into the Prismatic threat assessment engine.

### Network Intelligence

Each scan captures all network activity generated by the page, including:

| Network Data | Description | Intelligence Value |
|-------------|-------------|-------------------|
| **HTTP Transactions** | All requests with full headers | Third-party service mapping |
| **Redirects** | Full redirect chain | Cloaking detection |
| **DNS Lookups** | All DNS resolutions performed | Infrastructure mapping |
| **IP Connections** | All server IPs contacted | Hosting analysis |
| **Cookies** | Tracking and session cookies | Tracking ecosystem mapping |
| **Console Logs** | JavaScript console output | Error and debug information |
| **WebSocket** | WebSocket connection attempts | Real-time communication channels |

### Verdict Classification

URLScan applies automated classification based on multiple signals:

| Signal | Weight | Description |
|--------|--------|-------------|
| **Known Phishing Kit** | High | Matches known phishing kit fingerprints |
| **Brand Impersonation** | High | DOM contains targeted brand logos/text |
| **Suspicious TLS** | Medium | Recently issued or free certificate |
| **Redirect Chains** | Medium | Multiple redirects before final page |
| **Form Analysis** | High | Login forms pointing to suspicious domains |
| **Resource Similarity** | Medium | Visual similarity to known malicious pages |
| **Domain Age** | Medium | Recently registered domains |
| **Content Obfuscation** | High | JavaScript obfuscation or encoding |

### Search Query Language

URLScan supports a powerful search syntax for finding existing scans across the community database:

| Query Example | Description |
|--------------|-------------|
| `domain:example.com` | Scans of specific domain |
| `page.title:"Login"` | Pages with specific title |
| `server:nginx AND country:RU` | Server type and country |
| `filename:wp-login.php` | WordPress login pages |
| `hash:sha256_hash` | Pages with specific content hash |
| `date:>now-7d` | Scans from last 7 days |
| `page.asn:AS13335` | Scans of domains on specific ASN |
| `page.asnname:"Cloudflare"` | Scans by ASN name |
| `verdicts.malicious:true` | All malicious verdicts |
| `task.tags:phishing` | Scans tagged as phishing |

## Rate Limits and Access

| Tier | Scans/Day | Search Results | Features |
|------|-----------|---------------|----------|
| **Free** | 100 | 100 per query | Public scans, basic search |
| **Starter** | 5,000 | 10,000 | Unlisted scans, full search |
| **Professional** | 25,000 | Unlimited | Private scans, bulk API |
| **Enterprise** | Custom | Unlimited | Dedicated infrastructure |

### Authentication

API key required for scan submission and advanced search. Browsing public results does not require authentication. The API key is passed via the `API-Key` header.

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/scan/` | POST | Submit URL for scanning |
| `/api/v1/result/{uuid}/` | GET | Get scan results |
| `/api/v1/search/` | GET | Search existing scans |
| `/api/v1/dom/{uuid}/` | GET | Get DOM content |
| `/screenshots/{uuid}.png` | GET | Get page screenshot |
| `/api/v1/similar/{uuid}/` | GET | Find visually similar pages |

## Use Cases

### Phishing Investigation
- Scan suspicious URLs without visiting them directly, eliminating analyst exposure risk
- Capture visual evidence with screenshots for incident documentation and reporting
- Identify brand impersonation through DOM analysis and visual similarity matching
- Trace redirect chains to reveal cloaking techniques used by phishing kits
- Preserve forensic evidence before threat actors modify or take down pages

### Threat Hunting
- Search for known phishing kit fingerprints across the community scan database
- Find pages mimicking your brand across the entire Internet using title and content searches
- Track malware distribution infrastructure through hosting and technology patterns
- Identify newly created domains hosting credential harvesting pages
- Monitor for watering hole attacks targeting specific industries

### Security Operations
- Automate URL triage in email security pipelines with API-based scanning
- Enrich security alerts with visual context (screenshots) and technical evidence
- Cross-reference with [VirusTotal](@/osint/virustotal.md) for comprehensive multi-engine verdicts
- Feed scan verdicts into [SIEM](@/glossary/siem.md) systems for correlated alerting
- Build blocklists from confirmed malicious scan results

### Incident Response
- Rapidly document and preserve evidence from reported phishing URLs
- Analyze infrastructure connections from malicious pages to identify related campaigns
- Extract indicators of compromise (IOCs) from HTTP transactions and DNS lookups
- Identify third-party services abused in attack infrastructure
- Generate visual reports for non-technical stakeholders

### Compliance and Risk Assessment
- Verify that organizational domains are not being impersonated in phishing campaigns
- Document web-based threats for [NIS2](@/glossary/nis2.md) incident reporting requirements
- Assess the threat landscape for supply chain domains
- Feed URL analysis data into [Prismatic Perimeter](@/apps/prismatic-perimeter.md) [security rating](@/glossary/security-rating.md)s

## Related Sources

- [VirusTotal](@/osint/virustotal.md) - Multi-engine file and URL scanning
- [AbuseIPDB](@/osint/abuseipdb.md) - IP reputation for servers hosting malicious content
- [Shodan](@/osint/shodan.md) - Infrastructure analysis of suspicious hosts
- [crt.sh](@/osint/crtsh.md) - [Certificate transparency](@/glossary/certificate-transparency.md) for newly registered domains
- [Have I Been Pwned](@/osint/haveibeenpwned.md) - Breach data linked to phishing campaigns
- [URLhaus](@/osint/urlhaus.md) - Malware distribution URL database
- [PhishTank](@/osint/phishtank.md) - Community phishing URL verification
- [IPQualityScore](@/osint/ipqualityscore.md) - URL phishing and malware detection

## Related Platform Components

- [OSINT Core](@/apps/prismatic-osint-core.md) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](@/apps/prismatic-perimeter.md) - URL analysis in [EASM](@/glossary/easm.md) threat assessment
- [HAWKEYE](@/apps/prismatic-hawkeye.md) - Phishing detection in visitor intelligence

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)