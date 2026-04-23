+++
title = "PhishTank"
weight = 36
[extra]
category = "global"
type = "threat"
module = "Phishtank"
description = "Community-driven phishing URL verification and intelligence database operated by Cisco Talos"
has_api = true
url = "https://phishtank.org"
rate_limit = "Varies by API key; database download unlimited"
capabilities = ["Phishing URL Check", "URL Submission", "Community Verification", "Phishing Database Download", "Domain Analysis", "Target Brand Identification", "Trend Analysis"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1114
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["PhishTank", "Community-driven", "Cisco", "Talos", "osint", "global", "Prismatic Platform", "URLs"]
tags = ["osint", "global", "phishtank", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "PhishTank - Prismatic Platform"
+++

## Overview

PhishTank, operated by Cisco Talos (formerly OpenDNS), is the world's largest community-driven phishing verification platform. Users submit suspected phishing URLs which are then verified by the community through a voting process. Once a URL is confirmed as phishing, it enters the verified phishing database -- a continuously updated feed of confirmed phishing sites that is used by browsers, email security gateways, and security tools worldwide. Since its launch in 2006, PhishTank has verified millions of phishing URLs, establishing itself as one of the most reliable and widely trusted sources of confirmed phishing intelligence.

PhishTank's community verification model provides a unique advantage over automated detection systems: human reviewers evaluate each submission, verifying that the URL genuinely attempts to impersonate a legitimate site for credential harvesting or other malicious purposes. This human-in-the-loop verification process produces high-confidence phishing classifications with very low false positive rates, making PhishTank data suitable for automated blocking decisions in security infrastructure.

The platform identifies not just the phishing URL but also the target brand being impersonated, enabling organizations to monitor phishing campaigns targeting their brand. This brand identification capability is essential for corporate security teams responsible for brand protection and anti-phishing operations. Within the Prismatic Platform, PhishTank provides phishing intelligence for the [OSINT Core](/apps/prismatic-osint-core/) URL analysis pipeline and feeds into the [Prismatic Perimeter](/apps/prismatic-perimeter/) [security rating](/glossary/security-rating/) engine.

## Data Sources and Coverage

PhishTank data is entirely community-sourced, with submissions from security researchers, automated honeypots, email security systems, and individual users worldwide. The verification process requires multiple community members to independently confirm a submission before it enters the verified database.

| Data Type | Description | Coverage |
|-----------|-------------|----------|
| **Phishing URLs** | Verified phishing URLs with full path | Millions of entries |
| **Verification Status** | Community-verified, pending, or invalid | Multi-voter consensus |
| **Target Brand** | Organization being impersonated (banks, tech, etc.) | Identified where possible |
| **Submission Date** | When the URL was first reported | Precise timestamp |
| **Verification Date** | When community reached consensus | Timestamp of confirmation |
| **Online Status** | Whether the phishing page is still active | Periodically checked |
| **Vote Count** | Number of community votes (valid/invalid) | Transparency metric |
| **Submitter** | Anonymous submitter identification | Contributor tracking |

### Verification Process

```
URL Submitted -> Community Votes -> Threshold Reached -> VERIFIED PHISH
                                 -> Not Phishing -> Marked Invalid
                                 -> Insufficient Votes -> Pending
```

The multi-voter verification requirement ensures that individual submission errors or disputes do not contaminate the verified database. A URL must receive sufficient confirmatory votes from independent community members before achieving verified status, creating a crowdsourced quality assurance mechanism.

## Technical Architecture

The Prismatic Platform integrates PhishTank through a dual-access architecture combining real-time API lookups with periodic bulk database downloads. The API provides instant URL checking for interactive investigation workflows, while the bulk database download enables high-performance local screening of large URL sets.

The local phishing database is downloaded every 30 minutes (the minimum interval permitted by PhishTank) and loaded into an ETS-backed lookup table for O(1) URL matching. This local database approach eliminates API latency for high-volume URL screening operations such as email gateway integration or web proxy analysis.

URL normalization is applied before lookup to handle common variations: protocol normalization (http/https), trailing slash handling, URL encoding differences, and query parameter ordering. This normalization ensures consistent matching regardless of how the URL is formatted in the query versus the database entry.

The adapter also implements a temporal analysis engine that tracks phishing campaign patterns over time, identifying surges in phishing activity targeting specific brands, tracking the lifecycle of phishing URLs from submission to takedown, and detecting recurring infrastructure patterns across campaigns.

## API Integration

PhishTank feeds phishing intelligence into the Prismatic URL analysis and brand protection pipelines.

```elixir
# Check if a URL is in the PhishTank database
{:ok, result} = PhishTank.check_url("https://suspicious-bank-login.com/verify")
# => %{
#   in_database: true,
#   phish_id: 8234567,
#   url: "https://suspicious-bank-login.com/verify",
#   verified: true,
#   verified_at: ~U[2024-03-15 14:30:00Z],
#   valid: true,
#   online: true,
#   target: "Chase Bank",
#   submission_time: ~U[2024-03-15 12:00:00Z],
#   details_url: "https://phishtank.org/phish_detail.php?phish_id=8234567"
# }

# Submit a suspected phishing URL
{:ok, submission} = PhishTank.submit_url("https://new-phishing-site.com/login",
  phish_detail_url: "https://legitimate-bank.com"
)

# Download the complete verified phishing database
{:ok, database} = PhishTank.download_database(format: :json)

# Search for phishing targeting a specific brand
{:ok, brand_phish} = PhishTank.search(target: "PayPal", online: true)

# Get recent phishing submissions
{:ok, recent} = PhishTank.recent(limit: 100)
```

### Brand Protection Pipeline

```elixir
defmodule PrismaticPerimeter.BrandProtection.PhishingMonitor do
  @moduledoc """
  Monitors for phishing campaigns targeting protected brands
  using PhishTank, URLScan, and IPQualityScore.
  """

  def monitor_brand(brand_name, brand_domains) do
    with {:ok, phishtank} <- PhishTank.search(target: brand_name, online: true),
         {:ok, urlscan} <- search_urlscan(brand_domains),
         {:ok, ct_domains} <- discover_lookalike_domains(brand_domains) do
      {:ok, %{
        brand: brand_name,
        active_phishing_urls: phishtank,
        suspicious_urls: urlscan,
        lookalike_domains: ct_domains,
        total_active_threats: count_active(phishtank, urlscan),
        recommendations: generate_takedown_recommendations(phishtank)
      }}
    end
  end
end
```

## Use Cases

### Phishing Detection
- Real-time URL checking against the verified phishing database for email security and web proxy integration
- Cross-reference with [URLScan](/osint/urlscan/) for visual verification and page analysis of suspected phishing sites
- Integration into automated security orchestration workflows for phishing triage and response
- Historical phishing URL analysis for incident investigation and threat research

### Brand Protection
- Monitor for phishing campaigns targeting your organization through brand identification tracking
- Track phishing trends and identify prolific campaigns to prioritize takedown efforts
- Feed brand [threat intelligence](/glossary/threat-intelligence/) into [Perimeter](/apps/prismatic-perimeter/) security ratings
- Generate takedown request documentation based on verified phishing evidence

### Threat Intelligence
- Correlate phishing URLs with [IPQualityScore](/osint/ipqualityscore/) fraud scoring for multi-source validation
- Map phishing infrastructure using [SecurityTrails](/osint/securitytrails/) DNS data to identify hosting patterns
- Feed confirmed phishing IOCs into [AlienVault OTX](/osint/alienvault-otx/) community threat intelligence pulses
- Track phishing kit reuse patterns across campaigns for threat actor attribution

### Security Operations
- Automated email attachment and link scanning against the PhishTank database
- Web proxy URL classification with PhishTank as a reputation data source
- Security awareness training metrics based on real phishing campaign data

## Data Quality

PhishTank's community verification model produces high-quality phishing classifications, though the crowdsourced nature introduces some latency between submission and verification.

| Quality Dimension | Assessment | Notes |
|-------------------|------------|-------|
| **Verification Accuracy** | Excellent -- multi-voter community consensus | Very low false positive rate |
| **Coverage** | Good -- community-dependent submission volume | Major campaigns well covered |
| **Timeliness** | Good -- most URLs verified within hours | Some verification lag |
| **Brand Identification** | Good -- target brand identified for most entries | Automated + manual tagging |
| **Historical Depth** | Excellent -- data from 2006 onward | Complete archive available |
| **Online Status Tracking** | Good -- periodic checks for URL availability | Not real-time |

### Access Methods

| Access Method | Rate Limit | Features |
|--------------|-----------|----------|
| **Web Interface** | Unlimited | URL check, submit, browse |
| **API (Free)** | Varies | URL lookup, recent phishing |
| **Database Download** | Once per 30 min | Full verified database (JSON/CSV) |
| **Developer API** | Higher limits | All features, bulk operations |

API key required via URL parameter for API access. Free registration provides API key.

## Platform Integration

Within the Prismatic Platform, PhishTank serves as a primary phishing intelligence source, integrated into both the OSINT Core URL analysis pipeline and the Perimeter security rating engine. Phishing URL data is correlated with other threat intelligence sources (URLScan, VirusTotal, IPQualityScore) to provide multi-source validated phishing assessments.

The brand protection workflow monitors PhishTank for new verified phishing targeting monitored brands, generating automated alerts and takedown documentation when active campaigns are detected.

## NABLA Compliance

PhishTank integration satisfies NABLA requirements through its community verification methodology. The multi-voter consensus requirement for verified status directly supports the Signal Plurality axiom. The Provenance Mandatory axiom is met through unique phish IDs, submission timestamps, and verification records. Time Decay is addressed through online status tracking, with offline phishing URLs receiving reduced relevance in current threat assessments.

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| **URL check (local database)** | < 1ms | 0.1-0.5ms |
| **URL check (API)** | < 500ms | 200-400ms |
| **Database download** | < 120s | 30-60s |
| **Brand search** | < 2s | 500ms-1.5s |
| **Database refresh cycle** | 30min | 30min (minimum) |
| **Local database entries** | N/A | 75,000+ active |

## Related Resources

- [URLScan](/osint/urlscan/) - URL analysis with screenshot and DOM capture
- [IPQualityScore](/osint/ipqualityscore/) - URL phishing and fraud scoring
- [VirusTotal](/osint/virustotal/) - Multi-engine URL scanning
- [AlienVault OTX](/osint/alienvault-otx/) - Community threat intelligence sharing
- [Spamhaus](/osint/spamhaus/) - Domain blocklists for phishing infrastructure
- [OSINT Core](/apps/prismatic-osint-core/) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](/apps/prismatic-perimeter/) - Phishing in security ratings

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)