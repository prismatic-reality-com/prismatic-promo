+++
title = "/web-crawler"
weight = 690
[extra]
category = "Intelligence"
description = "Automated web crawling and structured data extraction"
syntax = "/web-crawler [options]"
authority = "L2+"
agent = "web-crawler-agent"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1118
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["web-crawler", "Automated", "commands", "Intelligence", "Prismatic Platform", "URLs", "OSINT", "HTML"]
tags = ["commands", "intelligence", "web-crawler", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/web-crawler - Prismatic Platform"
+++

## Overview

**/web-crawler** is a production command in the **Intelligence** category of the Prismatic Platform. It provides automated web crawling and structured data extraction for [OSINT](/glossary/osint/) investigations, competitive intelligence, and data collection operations. The command manages configurable crawlers that traverse web pages, extract structured data using CSS selectors and XPath expressions, follow links within defined boundaries, respect robots.txt and rate limits, and output normalized data in multiple formats. It is the primary data acquisition tool for the platform's intelligence gathering pipeline.

This command operates under the **L2+** authority level and is executed by the `web-crawler-agent` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The web-crawler-agent handles HTTP request management, HTML parsing, data extraction, politeness enforcement, and output formatting. It integrates with the platform's broader OSINT ecosystem for data enrichment and correlation.

Web crawling on the Prismatic Platform follows strict ethical guidelines. All crawlers respect robots.txt directives, implement configurable rate limiting (default: 1 request per second per domain), identify themselves with a proper User-Agent string, and never access authenticated or restricted content without explicit authorization. The crawler is designed for open-source intelligence gathering from publicly accessible sources only.

## Architecture

The web crawler operates as a multi-stage pipeline: URL management, HTTP fetching, content parsing, data extraction, and output formatting.

### Crawler Architecture

```
             /web-crawler
                   |
           Crawler Manager
                   |
          +--------+--------+
          |        |        |
       URL       HTTP      Parser
       Queue     Client    Engine
          |        |        |
    +-----+--+ +--+--+ +--+--+
    |    |   | |  |  | |  |  |
   Seed  Disc Rate Retry CSS  XPath
   URLs  Filter Limit Logic Select Parse
    |    |   | |  |  | |  |  |
    +----+---+-+--+--+-+--+--+
                   |
          Data Extractor
                   |
          +--------+--------+
          |        |        |
       Schema   Transform  Normalize
       Match    Pipeline   Engine
          |        |        |
          +--------+--------+
                   |
          Output Formatter
                   |
          +--------+--------+
          |        |        |
       JSON     CSV      Structured
       Export   Export    Storage
```

### Crawler Modes

| Mode | Description | Use Case | Depth |
|------|-------------|----------|-------|
| **Single Page** | Extract data from one URL | Targeted data extraction | 0 |
| **Shallow Crawl** | Follow links one level deep | Landing page + linked resources | 1 |
| **Deep Crawl** | Multi-level link following | Comprehensive site mapping | 2-5 |
| **Focused Crawl** | Follow only matching links | Topic-specific data collection | Variable |
| **Sitemap Crawl** | Parse sitemap.xml entries | Systematic site coverage | N/A |

### Politeness Controls

| Control | Default | Purpose |
|---------|---------|---------|
| **Rate Limit** | 1 req/sec/domain | Prevent server overload |
| **Concurrent Requests** | 3 | Limit parallel connections |
| **robots.txt** | Respected | Honor server preferences |
| **Crawl Delay** | From robots.txt | Server-specified delay |
| **User-Agent** | PrismaticCrawler/1.0 | Transparent identification |
| **Max Pages** | 100 | Prevent runaway crawls |
| **Request Timeout** | 30s | Handle slow responses |

## Usage

```bash
# Extract data from single page
/web-crawler --url "https://example.com/page" --extract "title,meta,links"

# Crawl site with depth limit
/web-crawler --url "https://example.com" --depth 2

# Extract specific data using CSS selectors
/web-crawler --url "https://example.com/products" --css ".product-name,.product-price"

# Focused crawl following specific link patterns
/web-crawler --url "https://example.com" --follow "/blog/*" --depth 3

# Export extracted data as JSON
/web-crawler --url "https://example.com" --extract all --format json --export ./data.json

# Crawl with custom rate limiting
/web-crawler --url "https://example.com" --rate-limit 0.5 --depth 2

# Sitemap-based crawl
/web-crawler --sitemap "https://example.com/sitemap.xml" --extract "title,h1,meta-description"

# Dry run showing crawl plan
/web-crawler --url "https://example.com" --depth 2 --dry-run

# Resume interrupted crawl
/web-crawler --resume ./crawl-state.json
```

### Practical Examples

```bash
# OSINT investigation: gather public company information
/web-crawler --url "https://or.justice.cz/ias/ui/rejstrik" --css ".company-name,.ico,.address" --format json

# Competitive intelligence: monitor pricing pages
/web-crawler --url "https://competitor.com/pricing" --css ".plan-name,.plan-price,.plan-features" --format csv

# Documentation crawl: index a technical documentation site
/web-crawler --sitemap "https://docs.example.com/sitemap.xml" --extract "title,h1,h2,code" --format json --export ./docs-index.json

# Security research: discover exposed endpoints
/web-crawler --url "https://target.com" --depth 2 --extract "links,forms,scripts" --format json

# Content monitoring: track page changes
/web-crawler --url "https://example.com/status" --extract "body" --diff --schedule "*/30 * * * *"
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--url` | `string` | none | Starting URL for the crawl |
| `--sitemap` | `string` | none | Sitemap URL for systematic crawling |
| `--depth` | `integer` | 0 | Maximum crawl depth (0 = single page) |
| `--follow` | `string` | `*` | URL pattern filter for link following |
| `--extract` | `string` | `title,meta,links` | Data fields to extract |
| `--css` | `string` | none | CSS selectors for data extraction |
| `--xpath` | `string` | none | XPath expressions for data extraction |
| `--format` | `enum` | `text` | Output format: `text`, `json`, `csv`, `markdown` |
| `--export` | `path` | none | Export data to file |
| `--rate-limit` | `float` | 1.0 | Requests per second per domain |
| `--concurrent` | `integer` | 3 | Maximum concurrent requests |
| `--max-pages` | `integer` | 100 | Maximum pages to crawl |
| `--timeout` | `duration` | `30s` | Request timeout |
| `--user-agent` | `string` | `PrismaticCrawler/1.0` | User-Agent string |
| `--dry-run` | `flag` | false | Show crawl plan without executing |
| `--resume` | `path` | none | Resume from saved crawl state |
| `--diff` | `flag` | false | Track and report content changes |
| `--verbose` | `flag` | false | Detailed crawl progress |
| `--respect-robots` | `flag` | true | Respect robots.txt (disable with caution) |

## Execution Flow

### Phase 1: Crawl Planning

The crawler manager analyzes the target URL, fetches robots.txt, determines allowed paths, parses sitemaps if specified, and builds the initial URL queue. The crawl plan is validated against politeness controls and scope limits.

### Phase 2: URL Queue Management

The URL queue manages crawl frontier: seed URLs are prioritized, discovered URLs are filtered against the follow pattern and domain boundary, duplicate URLs are eliminated, and crawled URLs are marked to prevent revisits. Queue ordering can be breadth-first (default) or depth-first.

### Phase 3: HTTP Fetching

URLs are fetched respecting rate limits and concurrency constraints. The HTTP client handles redirects (up to 5 hops), retries on transient failures (429, 503 with exponential backoff), and content type verification (only HTML pages are parsed for links). Responses are cached to avoid redundant fetches.

### Phase 4: Content Parsing and Extraction

HTML responses are parsed into DOM trees. CSS selectors and XPath expressions extract specified data fields. Link discovery extracts href attributes for queue expansion. The parser handles malformed HTML gracefully, recovering partial data from broken pages.

### Phase 5: Data Normalization

Extracted data is normalized: whitespace is trimmed, HTML entities are decoded, URLs are resolved to absolute form, dates are parsed into standard format, and duplicate entries are collapsed. The normalization pipeline ensures consistent output regardless of source page formatting.

### Phase 6: Output and Storage

Normalized data is formatted for the requested output format and either displayed or exported to file. Crawl state (queue, visited URLs, extracted data) is periodically checkpointed for resume capability.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/investigate](/commands/investigate/) | Consumer | Investigation uses crawler for data acquisition |
| [/email-osint](/commands/email-osint/) | Peer | Email OSINT may trigger targeted crawls |
| [/google-hacking](/commands/google-hacking/) | Peer | Google dorking discovers URLs for crawling |
| [/osint-engines](/commands/osint-engines/) | Upstream | OSINT engines coordinate with crawlers |
| [/ghost-recon](/commands/ghost-recon/) | Peer | Stealth recon uses targeted page extraction |
| [Prismatic Perimeter](/apps/prismatic-perimeter/) | Consumer | EASM uses crawling for asset discovery |
| [Telemetry](/glossary/telemetry/) | Monitoring | Crawl performance metrics |
| [Quality Gates](/glossary/quality-gates/) | Enforcement | Crawl configurations validated |

## Best Practices

### Rate Limiting Discipline

Always maintain rate limiting at or below 1 request per second per domain. Increase only when explicitly authorized by the target site's terms of service. Aggressive crawling damages target servers and can result in IP blocking that affects the entire platform.

### Scope Boundaries

Use `--follow` patterns and `--max-pages` to prevent crawl scope explosion. A depth-3 crawl on a large site can generate millions of URLs. Always start with `--dry-run` to estimate crawl scope before executing.

### Data Validation

Validate extracted data before using it in downstream intelligence operations. Web content can be manipulated, stale, or inconsistent. Cross-reference crawler data with other OSINT sources for accuracy.

### Ethical Crawling

Never crawl authenticated content, paywalled resources, or personal data without explicit authorization. The platform's OSINT mandate covers publicly accessible sources only. When in doubt, consult the target site's terms of service and robots.txt.

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `URL_INVALID` | Malformed URL provided | Check URL format |
| `ROBOTS_DENIED` | robots.txt disallows crawling | Respect the directive or narrow scope |
| `RATE_LIMITED` | Target server returned 429 | Reduce rate limit |
| `CONNECTION_REFUSED` | Cannot connect to target | Verify target is accessible |
| `PARSE_FAILURE` | Cannot parse HTML content | Check for non-HTML content |
| `DEPTH_EXCEEDED` | Crawl reached maximum depth | Increase depth or narrow focus |
| `MAX_PAGES_REACHED` | Crawled maximum allowed pages | Increase limit or narrow scope |
| `TIMEOUT` | Request exceeded timeout | Increase timeout or check network |

## Advanced Usage

### Custom Extraction Schemas

Define structured extraction rules:

```bash
/web-crawler --url "https://example.com/products" --schema ./schemas/product-extraction.yaml --format json
```

### Scheduled Monitoring

Set up periodic crawls for change detection:

```bash
/web-crawler --url "https://example.com/status" --diff --schedule "0 */6 * * *" --notify-on-change
```

### Multi-Site Crawl Campaign

Crawl multiple sites in coordinated campaign:

```bash
/web-crawler --campaign ./campaigns/competitors.yaml --format json --export ./intelligence/
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every URL in scope is crawled, every extraction rule is applied, every politeness control is enforced without exception.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Extracted data includes source URLs, extraction timestamps, and confidence indicators. No data is reported without verifiable provenance.

## Related Commands

- [/investigate](/commands/investigate/) - Launch comprehensive [OSINT](/glossary/osint/) investigation across 121+ sources
- [/email-osint](/commands/email-osint/) - Email-based OSINT gathering with breach correlation and social profiling
- [/google-hacking](/commands/google-hacking/) - Google dorking and advanced search intelligence extraction
- [/ghost-recon](/commands/ghost-recon/) - Stealth OSINT reconnaissance and passive intelligence gathering
- [/osint-engines](/commands/osint-engines/) - Multi-engine OSINT provider coordination and management
- [/delta-force](/commands/delta-force/) - Precision OSINT operations with surgical data extraction
- [/navy-seal](/commands/navy-seal/) - Deep-water OSINT operations in restricted information spaces

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)