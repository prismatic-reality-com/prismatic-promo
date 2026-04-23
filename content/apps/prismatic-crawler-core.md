+++
title = "Prismatic Crawler Core"
weight = 41
[extra]
icon = "arrow-path"
color = "teal"
description = "Web crawling engine with rate limiting, politeness, and structured extraction"
category = "Collection"
files = "230"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1241
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Crawler", "Core", "crawling", "engine", "limiting", "politeness", "structured", "extraction", "apps"]
tags = ["apps", "collection", "prismatic-crawler-core", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Crawler Core - Prismatic Platform"
+++

## Overview

Prismatic Crawler Core is the platform's web crawling engine, providing HTTP-based data collection with comprehensive [rate limiting](/glossary/rate-limiting/), robots.txt compliance, and structured content extraction. It manages prioritized crawl queues, handles authentication for protected resources, respects politeness policies, and extracts structured data from HTML pages using configurable CSS and XPath selectors.

The crawler serves as the foundational collection mechanism for several platform subsystems. [OSINT monitoring](/apps/prismatic-osint-monitoring/) uses it to periodically check web-accessible intelligence sources. The [Czech autocrawler](/apps/prismatic-czech-autocrawler/) leverages its extraction capabilities for [registry](/glossary/registry-otp/) data collection. [Prismatic Perimeter](/apps/prismatic-perimeter/) relies on it for web technology fingerprinting and content analysis during [attack surface](/glossary/attack-surface/) discovery.

Resilience is a core design principle. The crawler implements retry with exponential backoff, proxy rotation with health checking, [circuit breakers](/glossary/circuit-breaker/) for persistently failing domains, and a dead letter queue for pages that cannot be successfully fetched after all retry attempts. This ensures that transient failures do not prevent data collection while persistent failures are surfaced for operator attention. The architecture follows [OTP](/glossary/otp/) supervision patterns with a configurable fetcher pool, per-domain rate limiting enforced through token bucket counters stored in [ETS](/glossary/ets/), and content extraction through pluggable CSS, XPath, JSON-LD, and microdata parsers.

## Architecture

The architecture follows a pipeline design from seed URL ingestion through HTTP fetching, content parsing, data extraction, and storage persistence. Each stage is independently supervised and horizontally scalable.

```
Seed URLs --> Queue Manager --> Fetcher Pool --> Parser --> Extractor --> Storage
                |                |              |          |
          Priority/Dedup   Rate Limiter     Encoding    CSS/XPath
          Domain Queue     Robots.txt       Detection   JSON-LD
          Depth Control    Proxy Rotation   HTML Parse  Microdata
                |                |              |
          Dead Letter      Circuit Breaker  Schema Map
```

The fetcher pool uses a configurable number of worker processes managed under a pool [supervisor](/glossary/supervisor/), with each worker handling one HTTP request at a time. Per-domain rate limiting is enforced through token bucket counters preventing any single crawl job from overwhelming target servers. The queue manager maintains separate per-domain queues with priority ordering, ensuring that high-priority pages are fetched before lower-priority discovery links.

### Process Topology

```
PrismaticCrawlerCore.Application (Supervisor, :one_for_one)
+-- PrismaticCrawlerCore.CrawlCoordinator (GenServer)
|     Crawl job orchestration and worker dispatch
+-- PrismaticCrawlerCore.QueueManager (GenServer)
|     Per-domain priority queues with deduplication
+-- PrismaticCrawlerCore.FetcherPool (PoolSupervisor)
|     Configurable worker pool for HTTP requests
+-- PrismaticCrawlerCore.RateLimiter (GenServer)
|     ETS-backed token bucket per domain
+-- PrismaticCrawlerCore.DeadLetterQueue (GenServer)
      Failed pages awaiting manual review
```

Requests enter the QueueManager where they are deduplicated and assigned to per-domain queues. The CrawlCoordinator checks the RateLimiter before dispatching work to the FetcherPool. Workers perform the HTTP request, feed the response through the Parser for encoding detection and HTML normalization, then pass the DOM to the Extractor for structured data retrieval. Results flow into the storage layer while the Coordinator updates queue state and schedules follow-up URLs discovered in the page.

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticCrawlerCore` | Public facade: `crawl/1`, `fetch/2`, `status/1`, `dead_letters/1` |
| `PrismaticCrawlerCore.Application` | OTP application entry point and supervisor |
| `PrismaticCrawlerCore.CrawlCoordinator` | Crawl job orchestration and worker dispatch |
| `PrismaticCrawlerCore.CrawlStrategy` | Configurable crawl strategies (breadth-first, depth-first, priority) |
| `PrismaticCrawlerCore.CrawlerBehaviour` | Behaviour definition for pluggable crawler implementations |
| `PrismaticCrawlerCore.ArtifactSerializer` | Crawl result serialization for storage and cross-system transfer |
| `PrismaticCrawlerCore.GraphBuilder` | Link graph construction from crawled page relationships |
| `PrismaticCrawlerCore.RecursionLimiter` | Depth and breadth limiting to prevent infinite crawl expansion |
| `PrismaticCrawlerCore.RevolutionaryPatterns` | Advanced crawl patterns for dynamic content discovery |
| `PrismaticCrawlerCore.RateLimiter` | Per-domain token bucket rate limiting with ETS storage |
| `PrismaticCrawlerCore.DeadLetterQueue` | Failed page tracking with retry metadata |

The CrawlerBehaviour defines the interface that pluggable crawler implementations must satisfy. This enables specialized crawlers (such as the Czech registry crawlers in [Prismatic Crawler](/apps/prismatic-crawler/)) to reuse the core infrastructure while providing domain-specific fetch logic, authentication handling, and extraction rules.

```elixir
defmodule PrismaticCrawlerCore.CrawlerBehaviour do
  @callback crawl(seed_url :: String.t(), opts :: keyword()) ::
    {:ok, CrawlResult.t()} | {:error, term()}

  @callback extract(html :: String.t(), selectors :: map()) ::
    {:ok, map()} | {:error, term()}

  @callback should_follow?(url :: String.t(), depth :: non_neg_integer()) ::
    boolean()
end
```

## Crawl Strategies

Prismatic Crawler Core supports three crawl strategies that determine the order in which URLs are processed from the queue. The choice of strategy significantly affects both the data collected and the resource consumption pattern.

**Breadth-first** crawling processes all pages at depth N before moving to depth N+1. This strategy provides the broadest coverage of a site's top-level structure and is preferred for attack surface discovery where understanding the site's overall architecture matters more than deep content analysis.

**Depth-first** crawling follows link chains to maximum depth before backtracking. This strategy is preferred for specific content extraction tasks where the target data is likely located deep within a site's navigation hierarchy, such as Czech registry detail pages accessed through multi-step form submissions.

**Priority-based** crawling assigns scores to discovered URLs based on configurable heuristics (URL pattern matching, content type hints, link anchor text analysis) and processes highest-priority URLs first regardless of depth. This strategy is used for intelligence-directed crawling where specific page types are more valuable than others.

## Configuration

```elixir
config :prismatic_crawler_core,
  fetcher_pool_size: 10,
  per_domain_rate_limit: {1, :second},
  global_rate_limit: {10, :second},
  respect_robots_txt: true,
  max_depth: 5,
  request_timeout: 30_000,
  retry_attempts: 3,
  backoff_strategy: :exponential,
  proxy_rotation: false,
  user_agent: "PrismaticBot/1.0 (+https://prismatic-prod.fly.dev/bot)",
  dead_letter_max_age: :timer.hours(72),
  max_queue_size_per_domain: 1000
```

Configuration controls pool size, rate limiting at both domain and global levels, robots.txt compliance, maximum crawl depth, request timeouts, retry behavior, and user agent identification. Proxy rotation can be enabled for distributed crawling through rotating proxy pools. The dead letter maximum age determines how long failed pages are retained before automatic cleanup.

## API Reference

```elixir
# Start a crawl job with structured extraction
{:ok, job} = PrismaticCrawlerCore.crawl(%{
  seed_urls: ["https://example.com"],
  max_depth: 3,
  selectors: %{title: "h1", content: "article", links: "a[href]"},
  rate_limit: {1, :second},
  strategy: :breadth_first
})

# Check crawl progress
{:ok, status} = PrismaticCrawlerCore.status(job.id)
# => %{pages_crawled: 145, pages_queued: 302, errors: 3, elapsed: "2m 34s"}

# Fetch a single page with extraction
{:ok, result} = PrismaticCrawlerCore.fetch("https://example.com/page",
  selectors: %{title: "h1", meta: "meta[name=description]"},
  follow_redirects: true)

# List dead letter queue entries for review
{:ok, failed} = PrismaticCrawlerCore.dead_letters(job.id)
# => [%{url: "https://...", attempts: 3, last_error: :timeout, last_attempt: ~U[...]}]

# Retry specific dead letter entries
:ok = PrismaticCrawlerCore.retry_dead_letters(job.id, urls: ["https://..."])
```

## Robots.txt and Politeness

The crawler implements full robots.txt parsing and compliance. On first contact with a domain, the crawler fetches and parses the robots.txt file, caching the parsed rules for subsequent requests. The parser handles standard directives (User-agent, Disallow, Allow, Crawl-delay) and common extensions (Sitemap). When a Crawl-delay directive is present for the crawler's user agent, the per-domain rate limiter is automatically adjusted to respect the specified delay, even if it is slower than the configured default.

Politeness extends beyond robots.txt compliance. The crawler monitors HTTP response headers for rate limiting signals (429 status codes, Retry-After headers, X-RateLimit-Remaining) and dynamically adjusts request frequency. A 429 response triggers immediate backoff with the delay specified by the Retry-After header, or a default exponential backoff if no header is present.

## Testing

Crawl coordination tests verify correct worker dispatch, rate limiting enforcement, and depth control. Extraction tests validate CSS selector and XPath parsing against known HTML fixtures. Resilience tests verify retry behavior, circuit breaker state transitions, and dead letter queue management.

Integration tests exercise the full crawl pipeline from seed URL through page fetch, parsing, extraction, and storage. Property-based tests use StreamData generators to produce random URL patterns and extraction selectors, verifying that the pipeline handles all valid inputs without crashes. Dead letter queue tests verify correct retention, retry, and cleanup behavior.

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic OSINT Monitoring](/apps/prismatic-osint-monitoring/) | Scheduled web checks for monitored entities |
| [Prismatic Czech Autocrawler](/apps/prismatic-czech-autocrawler/) | Registry crawling built on Crawler Core primitives |
| [Prismatic Perimeter](/apps/prismatic-perimeter/) | Web content analysis during attack surface discovery |
| [Prismatic Storage](/apps/prismatic-storage/) | Extracted data persisted through the storage layer |
| [Prismatic Browser](/apps/prismatic-browser/) | Headless browser for JavaScript-rendered pages |
| [Prismatic Crawler](/apps/prismatic-crawler/) | Higher-level crawl orchestration and job management |
| [Prismatic Resilience](/apps/prismatic-resilience/) | Circuit breaker patterns for failing target domains |

## NABLA Compliance

| NABLA Axiom | Crawler Core Enforcement | Implementation |
|-------------|------------------------|----------------|
| Provenance Mandatory | Every crawled page carries source URL, timestamp, and HTTP metadata | Crawl results include full request/response provenance |
| Time Decay | Crawl freshness timestamps enable stale data detection | Each extraction result carries fetch timestamp |
| Unknown Valid | Failed pages and partial extractions explicitly tracked | Dead letter queue surfaces failures rather than silently discarding |
| Source Independence | Per-source rate limiting and error handling independence | Each domain tracked independently for health and rate state |

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Single page fetch | 200ms-3s | Depends on target server response time |
| CSS extraction | < 10ms | Per page after HTML parsing |
| XPath extraction | < 15ms | Per page after HTML parsing |
| Rate limiter check | < 0.1ms | ETS token bucket lookup |
| Queue management | < 1ms | Priority queue operations |
| Robots.txt parse | < 5ms | Per domain, cached after first fetch |

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| Memory | 256 MB | 512 MB |
| CPU | 2 cores | 4 cores |

[Telemetry](/glossary/telemetry/) events: `[:prismatic, :crawler_core, :fetch]`, `[:prismatic, :crawler_core, :extract]`, `[:prismatic, :crawler_core, :dead_letter]`, `[:prismatic, :crawler_core, :rate_limited]`. Metrics include pages per second, error rate, queue depth, and dead letter queue size.

## Related Resources

- [Prismatic Browser](/apps/prismatic-browser/) -- Headless browser for JavaScript-rendered pages
- [Prismatic Crawler](/apps/prismatic-crawler/) -- Higher-level crawl orchestration and job management
- [Prismatic Compression](/apps/prismatic-compression/) -- Response decompression for crawled content
- [Competitor Researcher](/agents/competitor-researcher/) -- Leverages crawler infrastructure for competitive intelligence collection
- [Adapter Pattern Specialist](/agents/adapter-pattern-specialist/) -- Ensures crawler extractors follow consistent adapter patterns
- [Architecture Review Specialist](/agents/architecture-review-specialist/) -- Reviews crawler pipeline architecture for resilience and scalability
- [Real-Time Monitoring](/capabilities/real-time-monitoring/) -- Continuous monitoring of crawl job health and throughput metrics
- [Autonomous Self-Healing](/capabilities/autonomous-self-healing/) -- Automatic recovery from crawler failures via circuit breakers and retry
- [Telemetry Integration](/capabilities/telemetry-integration/) -- Crawl performance metrics emitted through the telemetry pipeline

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)