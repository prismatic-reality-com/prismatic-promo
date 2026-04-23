+++
title = "Common Crawl"
weight = 63
[extra]
category = "global"
type = "domain"
module = "CommonCrawl"
description = "Open repository of petabyte-scale web crawl data for domain intelligence and content analysis"
has_api = true
url = "https://commoncrawl.org"
rate_limit = "S3 access: AWS rate limits apply; Index API: reasonable use"
capabilities = ["Domain Discovery", "URL Indexing", "Content Analysis", "Historical Snapshots", "Link Graph", "Technology Detection", "Subdomain Enumeration"]
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1818
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Common", "Crawl", "Open", "osint", "global", "Prismatic Platform", "Common Crawl"]
tags = ["osint", "global", "common-crawl", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Common Crawl - Prismatic Platform"
+++

## Overview

Common Crawl is a non-profit organization that maintains an open repository of web crawl data, freely accessible to anyone for research, analysis, and intelligence purposes. The corpus contains petabytes of web content collected over more than a decade, with monthly crawls capturing billions of pages from across the global Internet. Each crawl cycle produces three primary data formats: raw page content stored as WARC (Web ARChive) files, structured metadata as WAT (Web Archive Transformation) files, and extracted plain text as WET (Web Archive Extraction Text) files. All data is stored on Amazon S3 for public access, with no authentication required for the index API and only standard AWS egress costs for raw data retrieval.

For [OSINT](@/glossary/osint.md) purposes, Common Crawl provides massive-scale domain intelligence without requiring active scanning. This passive nature is a critical advantage: analysts can discover subdomains, map website technology stacks, find exposed content, and analyze link relationships entirely from historical crawl data, leaving no fingerprints on target infrastructure. The columnar index enables efficient searching by domain, URL pattern, or content type without downloading the full multi-petabyte dataset.

Within the Prismatic platform, Common Crawl serves as a passive domain reconnaissance source, complementing active scanners like [Shodan](@/osint/shodan.md) and [Censys](@/osint/censys.md) with historical web content intelligence. The passive nature of Common Crawl data makes it particularly valuable for reconnaissance phases where active scanning might alert the target or violate engagement scope limitations.

Common Crawl data has been used extensively in academic research, natural language processing training (including large language model pre-training), web science studies, and commercial intelligence applications. Its open nature and massive scale make it a foundational resource for any web-based intelligence operation.

## Data Sources and Coverage

Common Crawl collects data through systematic web crawling using the Nutch crawler framework, which follows hyperlinks to discover and capture web content across the global Internet.

| Data Type | Description | Scale |
|-----------|-------------|-------|
| **URL Index** | Searchable index of all crawled URLs with metadata | 3+ billion URLs per crawl |
| **WARC Records** | Raw HTTP responses including headers and body content | Petabytes total |
| **WAT Metadata** | Parsed metadata: links, headers, server info, extracted entities | Structured JSON |
| **WET Text** | Extracted plain text from HTML pages (markup stripped) | Terabytes per crawl |
| **Link Graph** | Domain-level and page-level link relationships | Billions of edges |
| **Subdomain Data** | All observed subdomains for any given domain | Passive discovery |
| **Technology Fingerprints** | Server headers, meta tags, script references | Per-page analysis |
| **Content Types** | MIME type distribution across domains | Statistical aggregation |

### Index Record Fields

Each URL in the Common Crawl index contains structured metadata that enables precise querying.

| Field | Description | Query Utility |
|-------|-------------|--------------|
| **urlkey** | SURT-formatted URL (reversed domain for efficient prefix search) | Domain-based filtering |
| **timestamp** | Crawl timestamp (YYYYMMDDHHMMSS format) | Temporal analysis |
| **url** | Original URL as crawled | Direct reference |
| **mime** | Content MIME type (text/html, application/json, etc.) | Content filtering |
| **status** | HTTP response status code | Accessibility analysis |
| **digest** | Content digest (SHA-1) for deduplication | Change detection |
| **length** | Response length in bytes | Size analysis |
| **offset/filename** | Location in WARC file on S3 | Raw data retrieval |
| **languages** | Detected page language codes | Linguistic filtering |

### Crawl Archive History

Common Crawl maintains monthly crawl archives dating back to 2008, with each archive identified by a crawl identifier such as CC-MAIN-2025-04. Earlier crawls captured fewer pages with longer intervals, while recent crawls consistently capture 3-4 billion pages per month. This temporal depth enables historical analysis of website changes, technology evolution, and content modifications over more than 15 years.

## Technical Architecture

Common Crawl's technical architecture is designed for massive-scale web collection, processing, and public access.

The crawling infrastructure uses Apache Nutch, an open-source web crawler that operates in a seed-and-expand model. Initial seed URLs are drawn from previous crawls, web directories, and submitted URLs. The crawler follows hyperlinks to discover new pages, respecting robots.txt directives and implementing politeness delays to minimize impact on target servers. Crawl scope is determined by a prioritization algorithm that balances breadth (covering more domains) against depth (capturing more pages per domain).

The data processing pipeline transforms raw crawl data through several stages. WARC files are generated during crawling, capturing complete HTTP request-response pairs. WAT files are derived from WARC records by parsing HTML, extracting links, metadata, and server headers into structured JSON. WET files strip HTML markup to produce plain text suitable for natural language processing and content analysis.

The index infrastructure uses a CDX (Capture/Digital index) format stored as columnar data on Amazon S3. The index API provides HTTP access to search the index by URL pattern, domain, or MIME type. For complex queries, the index data is available as Parquet files that can be queried using Amazon Athena (serverless SQL), Apache Spark, or other big data frameworks.

Public access is provided through Amazon S3 with requester-pays for raw data download and free access to the index API. The total archive size exceeds 80 petabytes across all crawl cycles, though individual crawls typically range from 50-100 terabytes of compressed data.

## API Integration

Common Crawl provides multiple access methods for programmatic data retrieval and analysis.

```elixir
defmodule PrismaticOsint.Adapters.CommonCrawl do
  @moduledoc """
  Common Crawl adapter for passive domain reconnaissance and
  web content intelligence within the Prismatic OSINT pipeline.
  """

  @index_url "https://index.commoncrawl.org"

  # Search the Common Crawl index for a domain
  def search(url_pattern, opts \\ []) do
    crawl = Keyword.get(opts, :crawl, latest_crawl())
    params = %{url: url_pattern, output: "json"}
    params = if limit = Keyword.get(opts, :limit), do: Map.put(params, :limit, limit), else: params

    with {:ok, response} <- http_get("#{@index_url}/#{crawl}-index", params) do
      records = parse_cdx_records(response)
      {:ok, records}
    end
  end

  # Enumerate subdomains from crawl data
  def subdomains(domain, opts \\ []) do
    with {:ok, records} <- search("*.#{domain}", opts) do
      subs =
        records
        |> Enum.map(&extract_subdomain(&1.url, domain))
        |> Enum.reject(&is_nil/1)
        |> Enum.uniq()
        |> Enum.sort()

      {:ok, subs}
    end
  end

  # Fetch a specific WARC record from S3
  def fetch_record(opts) do
    offset = Keyword.fetch!(opts, :offset)
    filename = Keyword.fetch!(opts, :filename)
    length = Keyword.fetch!(opts, :length)

    with {:ok, warc_data} <- fetch_s3_range(filename, offset, length) do
      {:ok, parse_warc_record(warc_data)}
    end
  end

  # Get crawl statistics for a domain
  def domain_stats(domain, opts \\ []) do
    with {:ok, records} <- search("*.#{domain}", opts) do
      {:ok, %{
        total_urls: length(records),
        subdomains: records |> Enum.map(&extract_subdomain(&1.url, domain)) |> Enum.uniq() |> length(),
        content_types: Enum.frequencies_by(records, & &1.mime),
        status_codes: Enum.frequencies_by(records, & &1.status),
        crawl_dates: Enum.map(records, & &1.timestamp) |> Enum.sort()
      }}
    end
  end

  # Search across multiple crawls for historical data
  def historical(url_pattern, opts \\ []) do
    crawl_count = Keyword.get(opts, :crawls, :last_12)
    crawls = get_crawl_list(crawl_count)

    tasks = Enum.map(crawls, fn crawl ->
      Task.async(fn -> search(url_pattern, crawl: crawl) end)
    end)

    results = Task.await_many(tasks, 60_000)

    merged =
      results
      |> Enum.zip(crawls)
      |> Enum.flat_map(fn {{:ok, records}, crawl} -> Enum.map(records, &Map.put(&1, :crawl, crawl)); _ -> [] end)
      |> Enum.sort_by(& &1.timestamp)

    {:ok, merged}
  end
end
```

### Passive Reconnaissance Pipeline

```elixir
defmodule PrismaticPerimeter.Recon.PassiveDomainDiscovery do
  @moduledoc """
  Passive domain reconnaissance using Common Crawl data
  combined with certificate transparency logs and DNS intelligence.
  """

  alias PrismaticOsint.Adapters.{CommonCrawl, Crtsh, DnsDumpster}

  def discover_attack_surface(domain) do
    tasks = [
      Task.async(fn -> CommonCrawl.subdomains(domain) end),
      Task.async(fn -> Crtsh.enumerate_subdomains(domain) end),
      Task.async(fn -> DnsDumpster.search(domain) end)
    ]

    [cc_result, ct_result, dns_result] = Task.await_many(tasks, 60_000)

    cc_subs = extract_ok(cc_result, [])
    ct_subs = extract_ok(ct_result, [])
    all_subdomains = Enum.uniq(cc_subs ++ ct_subs)

    {:ok, %{
      domain: domain,
      subdomains: all_subdomains,
      total_discovered: length(all_subdomains),
      sources: %{
        common_crawl: length(cc_subs),
        ct_logs: length(ct_subs)
      },
      dns_records: extract_ok(dns_result, []),
      technology_stack: extract_technologies(cc_subs, domain),
      discovered_at: DateTime.utc_now()
    }}
  end
end
```

## Use Cases

### Passive Domain Reconnaissance

Common Crawl enables comprehensive domain reconnaissance without any direct interaction with target infrastructure. This passive approach is essential for reconnaissance phases where active scanning might be detected or prohibited. Key capabilities include enumerating subdomains without active DNS brute-forcing or certificate scanning, discovering hidden pages and directories that may not be linked from the main site, finding exposed configuration files, backups, or sensitive content inadvertently published, mapping URL structure and site architecture to understand application topology, and identifying URL patterns that suggest administrative interfaces, API endpoints, or development environments.

### Technology Intelligence

The WAT metadata and HTTP response headers captured by Common Crawl enable technology profiling at scale. Analysts can identify web technologies via server headers, JavaScript library references, and page content patterns, track technology adoption and migration over time across monthly crawl snapshots, find instances of vulnerable software versions deployed across target domains, compare technology stacks across competitors or industry peers, and detect outdated content management systems, frameworks, and libraries with known security vulnerabilities.

### Content Analysis and Change Detection

Common Crawl's historical archive enables temporal analysis of web content changes. This is valuable for monitoring web content changes over time to detect unauthorized modifications, detecting brand impersonation and phishing sites that clone legitimate content, extracting contact information, organizational data, and personnel details from web pages, analyzing link relationships between domains for corporate structure mapping, and identifying content removal patterns that may indicate data breach cleanup or regulatory compliance actions.

### Link Graph Analysis

The WAT files contain extracted hyperlinks, enabling domain-level and page-level link graph construction. This link intelligence supports identifying inbound link patterns for domain authority assessment, mapping organizational relationships through cross-domain linking patterns, detecting link networks associated with SEO manipulation or coordinated inauthentic behavior, and discovering partner, vendor, and customer relationships through reciprocal linking.

## Data Quality and Validation

Common Crawl data quality is influenced by several factors that analysts must consider when using it for intelligence purposes.

Coverage is non-uniform across the web. High-traffic, well-linked websites are crawled more frequently and thoroughly than obscure or newly registered domains. The crawl prioritization algorithm favors breadth over depth, meaning that large websites may have incomplete page coverage. Analysts should treat Common Crawl as a representative sample rather than a complete census of any individual website.

Temporal resolution is limited to monthly crawl cycles. Changes between crawls are not captured, and the exact crawl date for a given page may vary within a multi-week crawl window. For time-sensitive investigations, Common Crawl should be supplemented with more frequent monitoring tools.

Content authenticity is dependent on the crawl capturing the page as served at crawl time. Dynamic content, JavaScript-rendered pages, and content behind authentication may not be fully captured. Common Crawl does not execute JavaScript during crawling, so single-page applications and dynamically loaded content may be incomplete.

Deduplication is handled at the content level using SHA-1 digests. Pages with identical content across crawls are deduplicated in the index, but the raw WARC files may contain duplicate captures. Analysts should use the digest field for change detection rather than relying on URL uniqueness.

## Platform Integration

Within the Prismatic ecosystem, Common Crawl provides passive domain intelligence for the [Prismatic Perimeter](@/apps/prismatic-perimeter.md) attack surface mapping pipeline. The integration operates alongside active scanning sources to provide a comprehensive view of target domains.

The subdomain discovery pipeline combines Common Crawl passive data with [crt.sh](@/osint/crtsh.md) certificate transparency data and [DNSDumpster](@/osint/dnsdumpster.md) DNS intelligence. This multi-source approach ensures maximum coverage while maintaining the passive nature required for initial reconnaissance phases.

Technology detection from Common Crawl feeds into the Prismatic Perimeter security rating engine, where outdated or vulnerable technologies identified in crawl data contribute to risk scoring. Historical crawl data enables trend analysis showing whether organizations are improving or degrading their technology security posture over time.

Content analysis capabilities support investigation workflows by enabling analysts to retrieve and analyze historical web content for target domains, supporting timeline construction and evidence gathering without requiring access to the live website.

## NABLA Compliance

The Common Crawl integration within Prismatic adheres to the NABLA epistemic framework.

**Signal Plurality**: Common Crawl data is always combined with at least one additional source for domain intelligence. Subdomain findings are cross-validated with certificate transparency logs, DNS records, and active scanning where authorized.

**Contradiction Preservation**: When Common Crawl data suggests different subdomains or technologies than active scanning results, both datasets are preserved. Discrepancies may indicate dynamic content, CDN variations, or temporal changes between crawl and scan dates.

**Time Decay**: Common Crawl timestamps are explicitly tracked, and the platform applies freshness weights that reduce confidence for data from older crawl cycles. Monthly crawl data older than 6 months receives significantly reduced weight in security assessments.

**Provenance Mandatory**: All Common Crawl data includes the crawl identifier, timestamp, WARC file reference, and index API query parameters. This enables complete reproducibility and audit trail for any finding derived from crawl data.

**Absence Informative**: The absence of a domain or subdomain from Common Crawl data is treated as informative signal rather than definitive evidence of non-existence. Low-traffic domains may not be crawled, so absence is tracked as a data gap requiring supplementary verification.

## Performance and Rate Limits

| Access Method | Cost | Features | Performance |
|---------------|------|----------|-------------|
| **Index API** | Free | URL search, metadata, pagination | 1-5 sec per query |
| **S3 Direct** | Free (egress costs) | Full WARC/WAT/WET record access | Depends on record size |
| **Athena SQL** | AWS costs (~$5/TB scanned) | SQL queries over columnar index | Seconds to minutes |
| **Local Download** | Storage costs | Full dataset download for offline analysis | Bulk transfer |

The Prismatic adapter implements result caching with 7-day TTL for subdomain enumeration results and 30-day TTL for technology detection data, reflecting the monthly crawl cycle. Query results are stored in ETS for fast in-process access with overflow to disk-based storage for large result sets.

## Related Resources

- [Wayback Machine](@/osint/wayback-machine.md) - Historical web page snapshots
- [crt.sh](@/osint/crtsh.md) - Certificate transparency subdomain discovery
- [DNSDumpster](@/osint/dnsdumpster.md) - DNS reconnaissance
- [BuiltWith](@/osint/builtwith.md) - Technology profiling
- [PassiveTotal](@/osint/passivetotal.md) - Passive DNS intelligence
- [OSINT Core](@/apps/prismatic-osint-core.md) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](@/apps/prismatic-perimeter.md) - Passive domain intelligence in attack surface mapping

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)