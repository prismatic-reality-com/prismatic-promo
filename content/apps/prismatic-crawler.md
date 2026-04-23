+++
title = "Prismatic Crawler"
weight = 17
[extra]
icon = "globe"
color = "teal"
description = "Web crawling infrastructure with rate limiting, politeness, and data extraction"
category = "Intelligence"
files = "410"
status = "Production"
port = "N/A"
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
word_count = 627
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Crawler", "crawling", "infrastructure", "limiting", "politeness", "extraction", "apps", "Intelligence", "Prismatic Platform"]
tags = ["apps", "intelligence", "prismatic-crawler", "prismatic"]
quality_score = 70
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Crawler - Prismatic Platform"
+++

## Overview

Prismatic Crawler provides the platform's web crawling and data extraction infrastructure. It powers the automated data collection from Czech government registries, [OSINT](@/glossary/osint.md) web sources, and target websites for the [Prismatic Perimeter](@/apps/prismatic-perimeter.md) [attack surface](@/glossary/attack-surface.md) discovery and [HAWKEYE](@/apps/prismatic-hawkeye.md) visitor intelligence systems.

The crawler implements strict politeness policies, respects robots.txt, enforces rate limits per domain, and manages a supervised pool of concurrent crawl workers. It is designed for intelligence gathering, not mass scraping -- quality and accuracy of extracted data take priority over volume. The application builds on [Prismatic Crawler Core](@/apps/prismatic-crawler-core.md) primitives while adding higher-level orchestration, specialized Czech registry crawlers, and pluggable extractor modules for technology detection, metadata extraction, email discovery, and form analysis.

The module contains a rich set of specialized crawlers including JusticeCz for the Czech Commercial Register, RZP for the Trade Register, Insolvency Register monitoring, InfoDeska Justice crawlers (with both standard and v2 implementations), and a Podnikatel crawler for business entity data. Each registry crawler handles the specific authentication patterns, anti-bot protections, HTML structures, and data formats used by its target portal. A pipeline orchestrator coordinates multi-step extraction jobs, and an LLM extractor and validator leverage AI for complex unstructured content extraction.

## Architecture

```
PrismaticCrawler
+-- Orchestrator      # Job management and scheduling
+-- WorkerPool        # Supervised crawl workers (poolboy)
+-- Queue             # URL frontier with priority queue
+-- PolitenessEngine  # Rate limiting, robots.txt, Crawl-delay
+-- Extractors        # Pluggable data extraction modules
|   +-- LinkExtractor
|   +-- TechnologyDetector
|   +-- MetadataExtractor
|   +-- EmailExtractor
|   +-- FormExtractor
+-- Registries        # Specialized Czech registry crawlers
|   +-- JusticeCz
|   +-- Rzp
|   +-- VrCz
|   +-- InsolvencniRejstrik
+-- Pipeline          # Multi-step extraction orchestration
+-- Cache             # Crawl result caching
+-- Storage           # Persistent crawl data storage
```

The worker pool pattern uses supervised processes under a pool supervisor:

```
Orchestrator --> Queue (URL Frontier)
                   |
          WorkerPool (10 workers)
          |    |    |    |    |
        W1   W2   W3   W4   W5 ...
          |    |    |    |    |
    PolitenessEngine (rate limiting)
          |
    HTTP Client --> Target
          |
    Extractors --> Results
```

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticCrawler` | Public facade: `crawl/2`, `status/1`, `results/1`, `stop/1` |
| `PrismaticCrawler.Application` | OTP application entry point |
| `PrismaticCrawler.HttpClient` | HTTP client with retry, proxy rotation, and timeout management |
| `PrismaticCrawler.TokenBucketRateLimiter` | Per-domain rate limiting via token bucket algorithm |
| `PrismaticCrawler.StateManager` | Crawl state management across long-running jobs |
| `PrismaticCrawler.PipelineOrchestrator` | Multi-step extraction pipeline coordination |
| `PrismaticCrawler.LlmExtractor` | AI-powered content extraction for unstructured data |
| `PrismaticCrawler.LlmValidator` | AI-powered validation of extracted data quality |
| `PrismaticCrawler.SearchStrategy` | Intelligent URL frontier prioritization |
| `PrismaticCrawler.Ingestion` | Extracted data ingestion into platform storage |
| `PrismaticCrawler.CzechRegistryCrawler` | Base module for Czech registry-specific crawling |
| `PrismaticCrawler.InfodeskaJusticeCrawler` | Czech InfoDeska Justice portal crawler |
| `PrismaticCrawler.PodnikatelCrawler` | Czech business entity data crawler |
| `PrismaticCrawler.MeilisearchIndexJob` | Search index population from crawled data |

## Configuration

```elixir
config :prismatic_crawler,
  global_rate_limit: {10, :second},
  per_domain_rate_limit: {1, :second},
  respect_robots_txt: true,
  respect_crawl_delay: true,
  user_agent: "PrismaticBot/1.0 (+https://prismatic-prod.fly.dev/bot)",
  max_concurrent_domains: 5,
  request_timeout: 30_000,
  retry_on_failure: true,
  max_retries: 3,
  backoff_strategy: :exponential,
  worker_pool_size: 10
```

## API Reference

```elixir
# Start a crawl job for a target domain
{:ok, job} = PrismaticCrawler.crawl("example.com",
  depth: 3, max_pages: 500, rate_limit: {1, :second},
  respect_robots: true, follow_external: false,
  extractors: [:links, :emails, :technologies, :metadata])

# Monitor crawl progress
{:ok, status} = PrismaticCrawler.status(job.job_id)

# Get crawl results with extracted data
{:ok, results} = PrismaticCrawler.results(job.job_id)

# Czech registry crawling
{:ok, data} = PrismaticCrawler.Registries.JusticeCz.crawl_company(ico)

# Stop a running crawl
:ok = PrismaticCrawler.stop(job.job_id)
```

## Testing

Worker pool tests verify correct allocation, release, and timeout handling. Rate limiter tests verify token bucket behavior including burst handling and per-domain isolation. Registry crawler tests use HTML fixtures from Czech government portals to verify extraction accuracy against known data.

Integration tests exercise the full crawl lifecycle from seed URL through extraction and storage. Politeness tests verify robots.txt parsing and Crawl-delay directive compliance. Pipeline orchestrator tests verify multi-step extraction coordination with simulated registry responses.

## Integration Points

| Application | Relationship |
|-------------|-------------|
| [Prismatic Perimeter](@/apps/prismatic-perimeter.md) | Attack surface discovery crawling |
| [Prismatic OSINT Core](@/apps/prismatic-osint-core.md) | OSINT data collection |
| [Prismatic Cache](@/apps/prismatic-cache.md) | Crawl result caching |
| [Prismatic Storage](@/apps/prismatic-storage.md) | Crawl data persistence |
| [Prismatic Telemetry](@/apps/prismatic-telemetry.md) | Crawl [metrics](@/glossary/metrics.md) and monitoring |
| [Prismatic Browser](@/apps/prismatic-browser.md) | JavaScript rendering for SPA targets |

The crawler feeds into the [EASM](@/glossary/easm.md) pipeline for web-based asset discovery, complementing data from [Shodan](@/osint/shodan.md), [Censys](@/osint/censys.md), and [crt.sh](@/osint/crtsh.md). Specialized crawlers extract structured data from Czech registries ([ARES](@/osint/ares.md), [Justice.cz](@/osint/justice-cz.md), [RZP](@/osint/rzp.md), [VR.cz](@/osint/vr-cz.md), [Insolvency Register](@/osint/insolvencni-rejstrik.md)).

## NABLA Compliance

| NABLA Axiom | Crawler Enforcement | Implementation |
|-------------|-------------------|----------------|
| Provenance Mandatory | Every crawled page carries full source metadata | URL, timestamp, HTTP headers, and extraction method recorded |
| Signal Plurality | Multiple extractors provide independent data signals | Technology, metadata, link, and email extractors run independently |
| Time Decay | Crawl timestamps enable data freshness tracking | Full crawl history retained for trend analysis |
| Unknown Valid | Failed extractions and ambiguous results explicitly flagged | Error categorization in dead letter queue |

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Concurrent workers | 10 (configurable) | Per deployment |
| Pages per second | 5-10 | With politeness compliance |
| Registry crawlers | 5 | Czech registries supported |
| Extractor modules | 5 | Pluggable extraction |

[Telemetry](@/glossary/telemetry.md) events: `[:prismatic, :crawler, :fetch]`, `[:prismatic, :crawler, :extract]`, `[:prismatic, :crawler, :job_complete]`.

## Related Resources

- [Prismatic Crawler Core](@/apps/prismatic-crawler-core.md) -- Low-level crawling primitives
- [Prismatic Browser](@/apps/prismatic-browser.md) -- JavaScript rendering support
- [Prismatic Czech Autocrawler](@/apps/prismatic-czech-autocrawler.md) -- Higher-level Czech registry automation
- [Competitor Researcher](@/agents/competitor-researcher.md) -- Competitive intelligence gathering
- [Adapter Pattern Specialist](@/agents/adapter-pattern-specialist.md) -- Extractor pattern compliance
- [Architecture Review Specialist](@/agents/architecture-review-specialist.md) -- Worker pool and politeness design review
- [Real-Time Monitoring](@/capabilities/real-time-monitoring.md) -- Crawl job health and throughput monitoring
- [Autonomous Self-Healing](@/capabilities/autonomous-self-healing.md) -- Automatic retry and circuit breaker recovery
- [Intelligence Synthesis](@/capabilities/intelligence-synthesis.md) -- Crawled data feeds into multi-source intelligence fusion

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)