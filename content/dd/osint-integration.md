+++
title = "OSINT Source Integration Framework"
weight = 80
date = "2026-02-17"

[extra]
tags = ["osint", "integration", "source-adapters", "intelligence", "data-collection", "due-diligence"]
icon = "globe-alt"
color = "cyan"
description = "Integration framework for 122 OSINT source adapters across 7 intelligence categories with parallel collection, normalization, and confidence scoring"
category = "data-sources"
status = "active"
author = "Tomáš Korcak (korczis)"
reading_time = "14 min"
word_count = 2500
difficulty = "advanced"
image = "/images/dd/osint-integration.png"
image_alt = "OSINT source integration framework with 122 adapters"
og_type = "article"
twitter_card = "summary_large_image"
academic_tier = "whitepaper"
content_version = "1.0.0"
last_enhanced = "2026-02-17"
quality_score = 92
see_also = ["methodology", "czech-registries", "entity-management", "risk-assessment"]
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["OSINT", "Source", "Integration", "Framework", "data sources", "Prismatic Platform", "Email", "Identity"]
+++

## Abstract

The Prismatic Platform integrates 122 [OSINT](/glossary/osint/) source adapters organized into seven intelligence categories, providing comprehensive data coverage for due diligence investigations across entity types, jurisdictions, and risk dimensions. Each adapter conforms to the `PrismaticOsintCore.Behaviours.Source` [behaviour](/glossary/behaviour/) contract, ensuring consistent error handling, rate limiting, credential management, and [telemetry](/glossary/telemetry/) across all sources. This document describes the integration architecture, the intelligence category taxonomy, the adapter behaviour contract, the parallel collection engine, and the normalization pipeline that transforms heterogeneous source data into the platform's unified [entity schema](/dd/entity-management/).

## Introduction

### The Breadth-Depth Trade-Off

Due diligence investigations must balance breadth of source coverage against depth of data extraction. A platform that queries only Czech registries provides deep but narrow coverage, missing global connections, cyber risk indicators, and international sanctions matches. Conversely, a platform that queries hundreds of shallow sources produces noise without actionable intelligence.

The Prismatic Platform resolves this trade-off through tiered source integration: deep, purpose-built adapters for [30+ Czech registries](/dd/czech-registries/) that extract structured data from specialized APIs, combined with 84+ global intelligence source adapters that provide breadth across infrastructure, threat, social, financial, and compliance domains. The [triple-check cross-validation methodology](/dd/methodology/) ensures that breadth does not come at the cost of accuracy by requiring multi-source corroboration before findings are accepted.

### Architecture Overview

The OSINT integration framework operates as a layered pipeline:

```
Investigation Trigger
        |
        v
Source Selection Engine (selects relevant sources per entity type)
        |
        v
Parallel Collection Engine (concurrent queries via Broadway)
        |
        v
Response Normalization Pipeline (heterogeneous data --> typed Findings)
        |
        v
Confidence Scoring (source-level validation)
        |
        v
Entity Merger (findings merged into entity profiles)
        |
        v
Cross-Validation Engine (triple-check methodology)
```

## Intelligence Categories

### Category Taxonomy

The 122 OSINT source adapters are organized into seven intelligence categories:

| Category | Sources | Description | Key Adapters |
|----------|---------|-------------|-------------|
| **Czech Registries** | 30+ | Government and regulatory databases | [ARES](/osint/ares/), [Justice.cz](/osint/justice-cz/), [ISIR](/osint/insolvencni-rejstrik/), [CUZK](/osint/cuzk/), [RZP](/osint/rzp/) |
| **Infrastructure Recon** | 18 | Network and infrastructure intelligence | [Shodan](/osint/shodan/), [Censys](/osint/censys/), [SecurityTrails](/osint/securitytrails/), [crt.sh](/osint/crtsh/) |
| **Threat Intelligence** | 15 | Vulnerability and malware data | [VirusTotal](/osint/virustotal/), [AlienVault OTX](/osint/alienvault-otx/), [AbuseIPDB](/osint/abuseipdb/), [GreyNoise](/osint/greynoise/) |
| **Social Intelligence** | 12 | Social and professional network data | [FullContact](/osint/fullcontact/), LinkedIn, social monitoring |
| **Email and Identity** | 10 | Email verification and identity data | [Hunter.io](/osint/hunter-io/), [HIBP](/osint/haveibeenpwned/), [EmailRep](/osint/emailrep/) |
| **Financial Intelligence** | 14 | Corporate, financial, and blockchain data | [OpenCorporates](/osint/open-corporates/), [SEC EDGAR](/osint/sec-edgar/), [Chainalysis](/osint/chainalysis/), [Etherscan](/osint/etherscan/) |
| **Compliance and Sanctions** | 8 | Sanctions lists and compliance databases | [OFAC](/osint/ofac/), [EU Sanctions](/osint/eu-sanctions/), [UN Sanctions](/osint/un-sanctions/), PEP databases |

### Category-Entity Type Mapping

Not all categories are relevant for all entity types. The source selection engine uses a mapping table to determine which sources to query for each entity type:

| Entity Type | Primary Categories | Secondary Categories |
|-------------|-------------------|---------------------|
| **Person** | Social Intelligence, Compliance | Email/Identity, Financial |
| **Company** | Czech Registries, Financial, Compliance | Infrastructure, Threat |
| **Domain** | Infrastructure Recon, Threat | Email/Identity |
| **Email** | Email/Identity, Social | Threat |
| **IP Address** | Infrastructure Recon, Threat | - |
| **Cryptocurrency** | Financial Intelligence, Compliance | - |
| **Phone** | Social Intelligence | Email/Identity |
| **Document** | Czech Registries | Financial |

## Adapter Behaviour Contract

### The Source Behaviour

Every OSINT source adapter implements the `PrismaticOsintCore.Behaviours.Source` behaviour, which defines the contract between the integration framework and individual source implementations:

```elixir
defmodule PrismaticOsintCore.Behaviours.Source do
  @callback name() :: String.t()
  @callback category() :: atom()
  @callback supported_entity_types() :: [atom()]
  @callback rate_limit() :: {count :: pos_integer(), period_ms :: pos_integer()}
  @callback query(entity :: Entity.t(), opts :: keyword()) ::
    {:ok, [Finding.t()]} | {:error, reason :: term()}
  @callback health_check() :: :ok | {:error, reason :: term()}
end
```

This contract ensures that:
- **Every adapter declares its capabilities**: name, category, supported entity types
- **Rate limiting is explicit**: each adapter specifies its rate limit parameters
- **Query interface is uniform**: all adapters accept an entity and return findings
- **Health is monitorable**: all adapters implement health checks for operational monitoring

### The Finding Struct

All adapters return results as typed `Finding` structs that normalize heterogeneous source data into a common format:

```elixir
defmodule PrismaticOsintCore.Finding do
  @type t :: %__MODULE__{
    source: String.t(),
    category: atom(),
    entity_type: atom(),
    entity_id: String.t(),
    attribute: String.t(),
    value: term(),
    confidence: float(),
    timestamp: DateTime.t(),
    raw_data: map(),
    metadata: map()
  }
end
```

The `Finding` struct captures both the normalized attribute value and the raw source response, enabling both automated processing and manual analyst review of original data.

## Parallel Collection Engine

### Broadway-Based Pipeline

The collection engine uses [Broadway](/glossary/broadway/) for concurrent, back-pressure-aware processing of OSINT queries. When an entity enters the enrichment phase, the source selection engine identifies all relevant sources and submits query tasks to the Broadway pipeline:

```
Entity Enrichment Request
        |
        v
Source Selection --> [Source A, Source B, Source C, ... Source N]
        |
        v
Broadway Pipeline (concurrent processing with back-pressure)
        |
        +---> Source A Worker --> Rate Limiter --> HTTP Client --> Response Parser
        +---> Source B Worker --> Rate Limiter --> HTTP Client --> Response Parser
        +---> Source C Worker --> Rate Limiter --> HTTP Client --> Response Parser
        ...
        +---> Source N Worker --> Rate Limiter --> HTTP Client --> Response Parser
        |
        v
Finding Aggregation
```

### Rate Limiting

Each source adapter declares its rate limit, and the collection engine enforces these limits through per-source token bucket rate limiters. This prevents the platform from overwhelming external APIs while maximizing throughput within allowed limits:

| Source Tier | Typical Rate Limit | Strategy |
|------------|-------------------|----------|
| Government registries | 1-10 req/sec | Conservative, respect published limits |
| Commercial APIs (free tier) | 5-100 req/min | Strict enforcement, avoid account suspension |
| Commercial APIs (paid tier) | 50-500 req/min | Maximize throughput within contracted limits |
| Open APIs | 100+ req/sec | Self-imposed limits to be a good citizen |

### Error Handling and Retry

The collection engine implements graduated retry logic for transient failures:

| Error Type | Retry Strategy | Max Retries |
|-----------|---------------|-------------|
| **HTTP 429 (Rate Limit)** | Respect Retry-After header, exponential backoff | 5 |
| **HTTP 5xx (Server Error)** | Exponential backoff: 1s, 2s, 4s, 8s, 16s | 5 |
| **Connection Timeout** | Immediate retry with increased timeout | 3 |
| **DNS Resolution Failure** | Retry after 30s | 2 |
| **HTTP 4xx (Client Error)** | No retry (likely invalid query) | 0 |
| **Authentication Failure** | No retry (credential issue) | 0 |

Failed queries after exhausting retries are recorded in the case log with the error details, ensuring that analysts are aware of any gaps in source coverage.

### Collection Metrics

The platform tracks detailed collection metrics through [Telemetry](/glossary/telemetry/):

| Metric | Description | Alert Threshold |
|--------|-------------|----------------|
| **Query latency** | Time from query submission to response | P95 > 10s |
| **Success rate** | Percentage of queries returning valid data | < 90% per source |
| **Rate limit utilization** | Fraction of rate limit consumed | > 90% (capacity planning) |
| **Error rate** | Percentage of queries resulting in errors | > 10% per source |
| **Data freshness** | Age of most recent successful query per source | > 24h for critical sources |

## Normalization Pipeline

### Data Normalization Stages

Raw source responses pass through a multi-stage normalization pipeline before entering the entity store:

**Stage 1: Response Parsing**
Each adapter implements source-specific parsing logic that extracts relevant fields from the raw API response. This handles the heterogeneity of response formats (JSON, XML, HTML, CSV) across different sources.

**Stage 2: Schema Mapping**
Parsed fields are mapped to the platform's unified attribute schema. For example, a company name field might be `name` in one source, `company_name` in another, and `legal_name` in a third. The schema mapping layer normalizes these to the canonical `legal_name` attribute.

**Stage 3: Value Normalization**
Attribute values are normalized to canonical formats:
- **Names**: Unicode normalization, diacritical mark handling, legal form abbreviation expansion
- **Addresses**: Component parsing (street, number, city, postal code), geocoding
- **Dates**: ISO 8601 normalization from various source formats
- **Numbers**: Currency conversion, unit normalization
- **Identifiers**: Format validation (ICO check digits, IBAN validation, etc.)

**Stage 4: Confidence Assignment**
Each normalized finding receives an initial confidence score based on the source's authority tier and data freshness, as described in the [triple-check methodology](/dd/methodology/).

**Stage 5: Entity Merge**
Normalized findings are merged into existing entity profiles through the [entity resolution](/dd/entity-management/) algorithm, which determines whether new findings match existing entities or represent newly discovered entities.

## Source Health Monitoring

### Continuous Health Checks

The platform runs continuous health checks against all configured OSINT sources, monitoring:

- **API availability**: Is the source responding to queries?
- **Data quality**: Are responses containing expected data structures?
- **Response time**: Is the source meeting latency expectations?
- **Authentication status**: Are API credentials valid and not expired?

### Source Degradation Handling

When a source fails health checks, the platform:

1. Marks the source as degraded in the source registry
2. Adjusts confidence scores for data previously collected from the source
3. Increases query frequency to alternative sources covering similar data
4. Alerts platform operators for investigation
5. Automatically re-enables the source when health checks pass again

This resilience ensures that the platform's due diligence capability degrades gracefully when individual sources experience issues, rather than failing catastrophically.

## Adding New Sources

### Adapter Development

New OSINT source adapters follow a standardized development process:

1. **Implement the Source behaviour**: Define name, category, entity types, rate limits, query logic, and health check
2. **Define schema mapping**: Map source response fields to the platform's unified attribute schema
3. **Configure rate limits**: Set appropriate rate limiting parameters based on the source's API documentation
4. **Write tests**: Comprehensive tests including unit tests for parsing, integration tests with recorded responses, and property-based tests for edge cases
5. **Register the adapter**: Add to the source registry with appropriate category and authority tier classification

The behaviour contract ensures that new adapters integrate seamlessly with the collection engine, normalization pipeline, and cross-validation framework without requiring changes to the core platform.

## Performance Characteristics

| Metric | Typical Value |
|--------|-------------|
| **Full entity enrichment (all sources)** | 5-30 seconds (parallel) |
| **Single source query** | 200ms - 2s |
| **Normalization pipeline throughput** | 1,000+ findings/second |
| **Concurrent source queries** | Up to 50 parallel |
| **Source health check cycle** | Every 5 minutes |
| **Total daily query capacity** | 100,000+ queries |

## Conclusion

The OSINT Source Integration Framework provides the data foundation for the Prismatic Platform's due diligence capability. By integrating 122 source adapters across seven intelligence categories through a uniform behaviour contract, the platform achieves both breadth (global coverage across entity types and risk dimensions) and depth (purpose-built Czech registry integration) while maintaining the data quality standards required by the [triple-check cross-validation methodology](/dd/methodology/).

## References

- [Czech Registry Integration](/dd/czech-registries/)
- [Triple-Check Methodology](/dd/methodology/)
- [Entity Management System](/dd/entity-management/)
- [Risk Assessment Framework](/dd/risk-assessment/)
- [OSINT Glossary](/glossary/osint/)
- [Broadway Pipeline](/glossary/broadway/)
- [Telemetry System](/glossary/telemetry/)
- [Adapter Pattern](/glossary/adapter-pattern/)
- [Behaviour Contract](/glossary/behaviour/)

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
