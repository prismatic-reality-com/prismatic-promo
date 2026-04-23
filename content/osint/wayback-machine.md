+++
title = "Wayback Machine"
weight = 45
[extra]
icon = "globe"
color = "cyan"
category = "global"
type = "domain"
module = "WaybackMachine"
source_type = "domain"
description = "Internet Archive historical snapshots - browse cached versions of websites dating back to 1996"
has_api = true
url = "https://web.archive.org"
rate_limit = "Free, public access, no official rate limit"
capabilities = ["Historical Snapshots", "URL Lookup", "Timestamp Search", "CDX API Search", "Bulk Availability", "Content Diffing"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 832
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Wayback", "Machine", "Internet", "Archive", "1996", "osint", "global", "Prismatic Platform", "Wayback Machine", "Description"]
tags = ["osint", "global", "wayback-machine", "prismatic"]
quality_score = 75
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Wayback Machine - Prismatic Platform"
+++

## Overview

The Wayback Machine is a digital archive of the World Wide Web operated by the Internet Archive, a non-profit library. Since 1996, it has been capturing snapshots of web pages, accumulating over 850 billion web pages across hundreds of millions of websites. The Wayback Machine allows users to browse historical versions of any archived website, revealing content that has since been changed, deleted, or taken offline.

For [OSINT](@/glossary/osint.md) analysts, the Wayback Machine is an invaluable tool for historical research. It enables recovery of deleted web content, identification of changes in organizational messaging, discovery of previously published information that subjects attempted to remove, and tracking the evolution of web infrastructure over time.

The archival depth varies by website -- high-traffic sites may have thousands of snapshots per year, while smaller sites might have only a handful. The crawling frequency depends on site popularity, external link volume, and explicit requests through the SavePageNow feature. Understanding this sampling behavior is important for investigators because the absence of a snapshot at a particular date does not mean the content did not exist, only that it was not captured at that moment.

## Data Coverage

| Data Type | Description |
|-----------|-------------|
| **Page Snapshots** | Full HTML captures of web pages at specific timestamps |
| **Capture Timeline** | All dates when a specific URL was archived |
| **HTTP Headers** | Response headers from the original server at capture time |
| **Linked Resources** | CSS, JavaScript, images, and other embedded resources |
| **URL Coverage** | All archived URLs under a given domain |
| **Content Changes** | Differences between snapshots over time |
| **MIME Types** | Content type classification for archived resources |
| **Status Codes** | HTTP response status codes at time of capture |

### Archive Scale

| Metric | Value |
|--------|-------|
| **Total Pages** | 850+ billion web pages |
| **Active Since** | 1996 |
| **Unique URLs** | Hundreds of billions |
| **Storage** | 70+ petabytes |
| **Growth Rate** | Billions of pages per month |
| **Websites** | Hundreds of millions of domains |

### Snapshot Fidelity

The quality of archived snapshots varies based on how they were captured:

| Fidelity Level | Description | Limitations |
|---------------|-------------|------------|
| **Full** | Complete HTML with all resources | Ideal for analysis |
| **Partial** | HTML present but some resources missing | CSS/images may fail |
| **JavaScript-Dependent** | Static HTML only, no JS execution | SPA content missing |
| **Redirect** | Only redirect chain captured | Original content not available |
| **Robots Excluded** | Site blocked by robots.txt | No content available |

## API Access

The Wayback Machine provides several API endpoints for programmatic access:

### Availability API

Check if a URL has been archived:
```
GET https://archive.org/wayback/available?url=example.com&timestamp=20240101
```

### CDX Server API

The CDX (Capture/Digital-indeX) API provides full programmatic access to the URL index:

```
GET https://web.archive.org/cdx/search/cdx?url=example.com&output=json
```

| Parameter | Description | Example |
|-----------|-------------|---------|
| **url** | Target URL (supports wildcards) | `example.com/*` |
| **matchType** | exact, prefix, host, domain | `domain` |
| **output** | Response format | `json`, `text` |
| **from/to** | Date range filter | `20200101`/`20241231` |
| **limit** | Maximum results | `1000` |
| **fl** | Fields to return | `timestamp,original,statuscode` |
| **filter** | Result filtering | `statuscode:200` |
| **collapse** | Deduplication | `timestamp:6` (monthly) |

## Integration with Prismatic

Prismatic Platform integrates the Wayback Machine as a historical intelligence source for investigation and [attack surface](@/glossary/attack-surface.md) analysis.

```elixir
# Check availability of a URL
{:ok, snapshot} = WaybackMachine.available("example.com")
# => %{
#   url: "https://web.archive.org/web/20240315120000*/example.com",
#   archived_snapshots: %{
#     closest: %{
#       status: "200",
#       available: true,
#       url: "https://web.archive.org/web/20240315120000/https://example.com",
#       timestamp: "20240315120000"
#     }
#   }
# }

# Get all snapshots for a URL (CDX API)
{:ok, snapshots} = WaybackMachine.cdx_search("example.com",
  from: "20200101",
  to: "20241231",
  output: :json
)

# Get all URLs ever captured under a domain
{:ok, urls} = WaybackMachine.cdx_search("example.com/*",
  match_type: :prefix,
  collapse: "urlkey",
  output: :json
)

# Save a page right now (SavePageNow)
{:ok, saved} = WaybackMachine.save("https://target-site.com/important-page")

# Search for specific file types under a domain
{:ok, pdfs} = WaybackMachine.cdx_search("example.com/*.pdf",
  match_type: :prefix,
  filter: "statuscode:200"
)

# Get content diff between two timestamps
{:ok, changes} = WaybackMachine.diff("example.com",
  timestamp_a: "20230101",
  timestamp_b: "20240101"
)
```

### Historical Intelligence Pipeline

```elixir
defmodule PrismaticOsint.Investigation.HistoricalAnalysis do
  @moduledoc """
  Analyzes historical web content using Wayback Machine archives
  to discover previously exposed information and track changes.
  """

  def analyze_domain_history(domain) do
    with {:ok, snapshots} <- WaybackMachine.cdx_search("#{domain}/*",
           match_type: :prefix, collapse: "urlkey"),
         {:ok, timeline} <- build_capture_timeline(domain),
         {:ok, exposed} <- find_exposed_content(snapshots) do
      {:ok, %{
        domain: domain,
        total_urls_captured: length(snapshots),
        capture_timeline: timeline,
        first_capture: earliest_timestamp(snapshots),
        last_capture: latest_timestamp(snapshots),
        exposed_files: exposed.sensitive_files,
        exposed_directories: exposed.open_directories,
        technology_evolution: track_technology_changes(snapshots),
        content_changes: significant_changes(snapshots)
      }}
    end
  end

  defp find_exposed_content(snapshots) do
    sensitive_patterns = [
      ~r/\.sql$/,
      ~r/\.env$/,
      ~r/\.bak$/,
      ~r/\.conf$/,
      ~r/wp-config/,
      ~r/phpinfo/,
      ~r/\.git\//,
      ~r/web\.config/
    ]

    sensitive_files =
      snapshots
      |> Enum.filter(fn snapshot ->
        Enum.any?(sensitive_patterns, &Regex.match?(&1, snapshot.url))
      end)

    {:ok, %{sensitive_files: sensitive_files, open_directories: []}}
  end
end
```

### Employee Directory Recovery

Historical snapshots often preserve employee directories, team pages, and contact information that organizations have since removed:

```elixir
defmodule PrismaticOsint.Investigation.DirectoryRecovery do
  @moduledoc """
  Recovers historical employee directories and contact pages
  from Wayback Machine archives for organizational mapping.
  """

  def recover_directories(domain) do
    team_paths = [
      "#{domain}/team", "#{domain}/about/team", "#{domain}/people",
      "#{domain}/staff", "#{domain}/our-team", "#{domain}/about-us"
    ]

    team_paths
    |> Enum.map(fn path ->
      case WaybackMachine.cdx_search(path, filter: "statuscode:200") do
        {:ok, snapshots} -> {path, snapshots}
        _ -> {path, []}
      end
    end)
    |> Enum.reject(fn {_, snapshots} -> Enum.empty?(snapshots) end)
  end
end
```

## Rate Limits and Access

| Aspect | Details |
|--------|---------|
| **Authentication** | None required for public access |
| **Rate Limit** | No official limit; excessive requests may be throttled |
| **Data Format** | JSON (CDX API), HTML (web interface) |
| **Cost** | Completely free (non-profit service) |
| **Robots.txt** | Some sites block archiving via robots.txt |
| **SavePageNow** | Free on-demand archiving of any URL |

### Practical Rate Considerations

While no official limits exist, the Internet Archive may throttle aggressive crawling. Recommended practices:

| Practice | Recommendation |
|----------|---------------|
| **Request interval** | 1-2 seconds between CDX API calls |
| **Concurrent requests** | Maximum 5-10 concurrent connections |
| **Bulk operations** | Use CDX API with pagination, not individual lookups |
| **Caching** | Cache CDX results locally for repeated analysis |

## Use Cases

### Deleted Content Recovery
- Recover deleted web content that subjects attempted to remove
- Access historical versions of pages changed after litigation or investigation
- Retrieve removed press releases, blog posts, or official statements
- Find previously published pricing, terms, or policy documents

### Organizational Intelligence
- Discover historical employee directories and team pages
- Track leadership changes through historical about pages
- Identify previously listed subsidiaries, partners, and vendors
- Map organizational evolution through website redesigns

### Security Research
- Find previously exposed sensitive files (configs, backups, source code)
- Track technology stack evolution for vulnerability research
- Discover historical API endpoints and authentication mechanisms
- Identify removed security advisories or incident disclosures

### Legal and Compliance
- Establish timelines of web presence for litigation support
- Document historical claims or representations made online
- Verify historical compliance statements and certifications
- Support trademark and intellectual property investigations

### Infrastructure Analysis
- Track historical DNS and hosting changes through archived headers
- Discover previously used CDNs, analytics, and third-party services
- Map the evolution of web infrastructure for attribution analysis
- Correlate with [SecurityTrails](@/osint/securitytrails.md) DNS history data

## Related Sources

- [SecurityTrails](@/osint/securitytrails.md) - Historical DNS data complementing web archives
- [BuiltWith](@/osint/builtwith.md) - Technology profiling for archived and current sites
- [Hunter.io](@/osint/hunter.md) - Email finding from current and historical pages
- [URLScan](@/osint/urlscan.md) - Current URL analysis and screenshot capture
- [DNSDumpster](@/osint/dnsdumpster.md) - Current DNS infrastructure mapping
- [ViewDNS](@/osint/viewdns.md) - DNS history and reverse lookups
- [Common Crawl](@/osint/common-crawl.md) - Alternative web archive with structured data

## Related Platform Components

- [OSINT Core](@/apps/prismatic-osint-core.md) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](@/apps/prismatic-perimeter.md) - Historical data in [EASM](@/glossary/easm.md) assessment

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)