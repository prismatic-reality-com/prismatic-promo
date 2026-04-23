+++
title = "Prismatic OSINT Core"
weight = 6
[extra]
icon = "search"
color = "cyan"
description = "121+ intelligence sources across 7 categories with unified interface"
category = "Intelligence"
files = "892"
status = "Production"
port = "N/A"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1432
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "OSINT", "Core", "intelligence", "sources", "across", "categories", "unified", "interface", "apps"]
tags = ["apps", "intelligence", "prismatic-osint-core", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic OSINT Core - Prismatic Platform"
+++

## Abstract

Prismatic [OSINT](@/glossary/osint.md) Core is the central intelligence gathering engine of the Prismatic Platform, providing unified access to 121+ Open Source Intelligence sources across seven categories: network intelligence, domain/DNS, [threat intelligence](@/glossary/threat-intelligence.md), business/financial, Czech registries, breach/leak databases, and vulnerability databases. The engine implements a source adapter [protocol](@/glossary/protocol.md) that normalizes heterogeneous API responses into a consistent schema, manages per-source [rate limiting](@/glossary/rate-limiting.md) and authentication, and supports parallel multi-source queries with automatic result deduplication and [confidence scoring](@/glossary/confidence-scoring.md). Each source adapter handles the specifics of its provider's API (REST, HTML scraping, database connection, file parsing), while the core orchestration layer manages query routing, result fusion, and source health monitoring. The architecture is designed around the NABLA epistemic framework, ensuring that intelligence assessments carry provenance metadata, confidence scores, and temporal timestamps from source through to consumption.

## 1. Introduction

### 1.1 Problem Statement

Intelligence analysis requires data from dozens of disparate sources, each with its own API format, authentication mechanism, rate limit policy, and data schema. [Shodan](@/glossary/shodan.md) returns JSON with host banners; ARES returns Czech business records in a government-specific XML format; VirusTotal returns malware analysis results; sanctions lists come as structured databases. An analyst or automated system querying these sources individually faces authentication management for each provider, rate limit compliance across concurrent queries, response format normalization for cross-source correlation, and manual deduplication of overlapping data.

Prismatic OSINT Core solves this by presenting a single unified interface through which any combination of sources can be queried in parallel, with results automatically normalized, deduplicated, and confidence-scored.

### 1.2 Design Goals

1. **Unified source interface** -- all 121+ sources accessible through a single adapter protocol with consistent query/response patterns.
2. **Source adapter isolation** -- each source adapter encapsulates its provider's authentication, rate limiting, response parsing, and error handling.
3. **Parallel multi-source queries** -- query multiple sources concurrently with configurable timeouts and partial result handling.
4. **Automatic result fusion** -- deduplicate, normalize, and confidence-score results from multiple sources.
5. **Rate limit compliance** -- enforce per-source rate limits globally, preventing API key suspension or banning.
6. **Source health monitoring** -- track availability, response times, and error rates for each source.
7. **Epistemic provenance** -- every intelligence datum carries source attribution, collection timestamp, and confidence level per [NABLA axioms](@/capabilities/nabla-axioms.md).

### 1.3 Scope

Prismatic OSINT Core provides the source adapter framework, query orchestration, and result fusion. Individual source adapters are organized into domain-specific sub-applications: [OSINT Network](@/apps/prismatic-osint-network.md), [OSINT Business](@/apps/prismatic-osint-business-financial.md), [OSINT Czech Legal](@/apps/prismatic-osint-czech-legal.md), [OSINT EU Institutions](@/apps/prismatic-osint-eu-institutions.md), [OSINT Social Media](@/apps/prismatic-osint-social-media.md), and [OSINT Sources](@/apps/prismatic-osint-sources.md).

## 2. Architecture

### 2.1 System Design

```
Application Query
       |
  PrismaticOSINT Facade
       |
  Source Router (capability-based selection)
       |
  +----+----+----+----+----+----+----+
  |    |    |    |    |    |    |    |
  Net  DNS  Threat Biz  Czech EU   Vuln
  (15) (10) (12)  (8)  (15)  (6)  (6)
  |    |    |    |    |    |    |    |
  Adapter Protocol (normalize + rate limit)
  |    |    |    |    |    |    |    |
  Shodan Censys VT   ARES  Justice ECB  NVD ...
       |
  Result Fusion Engine
  (deduplicate + confidence score + provenance)
       |
  Intelligence Result
```

### 2.2 Core Components

| Module | Responsibility |
|--------|----------------|
| `PrismaticOsintCore` | Public facade: `search/2`, `build_company_profile/1`, `check_reputation/1` |
| `PrismaticOsintCore.SourceRouter` | Capability-based source selection and query routing |
| `PrismaticOsintCore.AdapterProtocol` | [Behaviour](@/glossary/behaviour.md) definition for source adapters (query, parse, normalize) |
| `PrismaticOsintCore.RateLimiter` | Per-source global rate limit enforcement using token bucket |
| `PrismaticOsintCore.ResultFusion` | Multi-source result deduplication, normalization, and scoring |
| `PrismaticOsintCore.SourceHealth` | Availability, latency, and error rate monitoring per source |
| `PrismaticOsintCore.Provenance` | Source attribution and NABLA-compliant metadata attachment |
| `PrismaticOsintCore.CredentialManager` | API key and authentication credential management |

### 2.3 Process Topology

```
PrismaticOsintCore.Application (Supervisor, :one_for_one)
+-- PrismaticOsintCore.SourceRouter (GenServer)
|     Maintains source capability registry and routing rules
+-- PrismaticOsintCore.RateLimiter (GenServer)
|     Token bucket rate limiters per source, global coordination
+-- PrismaticOsintCore.SourceHealth (GenServer)
|     Health metrics collection and availability tracking
+-- Task.Supervisor
      Supervises concurrent source queries
```

### 2.4 Data Flow

A query enters through the facade, which determines which sources to query based on the query type and requested categories. The SourceRouter selects adapters that match the query capabilities. Queries are dispatched in parallel via Task.[Supervisor](@/glossary/supervisor.md), with each query passing through the RateLimiter before reaching the source adapter. Adapter responses are parsed, normalized to the platform's entity schema, annotated with provenance metadata, and passed to the ResultFusion engine for deduplication and confidence scoring. The final intelligence result is returned to the caller.

## 3. Implementation

### 3.1 Key Algorithms

**[Intelligence Fusion](@/glossary/intelligence-fusion.md)**. When multiple sources return data about the same entity, the fusion engine performs [entity resolution](@/glossary/entity-resolution.md) (matching records across sources), field-level deduplication (preferring the most authoritative source for each field), confidence scoring (higher confidence when multiple independent sources agree), and temporal selection (preferring the most recent data when timestamps differ).

**Rate Limiting**. Each source has a token bucket rate limiter with configurable capacity and refill rate. When a query would exceed the rate limit, it is queued with priority ordering. Critical queries (security incidents) receive priority over routine monitoring queries.

### 3.2 Data Structures

```elixir
defmodule PrismaticOsintCore.IntelligenceResult do
  @type t :: %__MODULE__{
    entity: String.t(),
    query_type: atom(),
    sources_queried: [atom()],
    sources_responded: [atom()],
    data: map(),
    confidence: float(),
    provenance: [Provenance.t()],
    collected_at: DateTime.t(),
    fusion_metadata: FusionMetadata.t()
  }
end
```

### 3.3 API Surface

```elixir
# Multi-source entity search
@spec search(String.t(), keyword()) :: {:ok, IntelligenceResult.t()} | {:error, term()}
PrismaticOsintCore.search("example.com", categories: [:network, :threat, :business])

# Build comprehensive company profile
@spec build_company_profile(String.t() | keyword()) :: {:ok, CompanyProfile.t()} | {:error, term()}
PrismaticOsintCore.build_company_profile("Example s.r.o.")

# Domain reputation check
@spec check_reputation(String.t()) :: {:ok, ReputationResult.t()} | {:error, term()}
PrismaticOsintCore.check_reputation("suspicious.domain.com")

# Sanctions screening
@spec sanctions_check(String.t(), [String.t()]) :: {:ok, SanctionsResult.t()} | {:error, term()}
PrismaticOsintCore.sanctions_check("Entity Name", ["EU", "US", "UK"])

# IP intelligence
@spec analyze_ip(String.t()) :: {:ok, IpIntelligence.t()} | {:error, term()}
PrismaticOsintCore.analyze_ip("1.2.3.4")
```

### 3.4 Configuration

```elixir
config :prismatic_osint_core,
  # Query orchestration
  default_timeout: 10_000,
  max_concurrent_queries: 20,
  partial_result_threshold: 0.5,

  # Rate limits (requests per hour per source)
  rate_limits: %{
    shodan: 100, censys: 250, virustotal: 500,
    abuseipdb: 1000, greynoise: 100, ares: 500,
    justice: 200, crtsh: 1000
  },

  # Source priorities (higher = preferred)
  source_priorities: %{
    shodan: 10, censys: 9, virustotal: 8,
    ares: 10, justice: 9
  }
```

## 4. Integration

### 4.1 Dependencies

| Application | Relationship |
|-------------|--------------|
| [Prismatic Cache](@/apps/prismatic-cache.md) | Query result caching (reduces API costs) |
| [Prismatic Resilience](@/apps/prismatic-resilience.md) | [Circuit breaker](@/glossary/circuit-breaker.md)s for source failures |
| [Prismatic Storage](@/apps/prismatic-storage.md) | Intelligence data persistence |
| [Prismatic Nabla](@/apps/prismatic-nabla.md) | Confidence scoring and provenance tracking |
| [Prismatic Telemetry](@/apps/prismatic-telemetry.md) | Source query [metrics](@/glossary/metrics.md) |

### 4.2 Dependents

| Application | Relationship |
|-------------|--------------|
| [Prismatic Perimeter](@/apps/prismatic-perimeter.md) | Evidence collection for [security rating](@/glossary/security-rating.md)s |
| [Prismatic HAWKEYE](@/apps/prismatic-hawkeye.md) | Visitor IP enrichment |
| [Prismatic Compliance](@/apps/prismatic-compliance.md) | Compliance evidence from OSINT data |
| [Prismatic Graph](@/apps/prismatic-graph.md) | Entity data for [knowledge graph](@/glossary/knowledge-graph.md) |
| [Prismatic Detection Engine](@/apps/prismatic-detection-engine.md) | Threat indicator feeds |

### 4.3 Inter-Process Communication

Source queries are dispatched as supervised Tasks for parallel execution. Results flow back through the fusion engine via Task.await_many. Source health metrics are published via [Phoenix](@/glossary/phoenix.md) [PubSub](@/glossary/pubsub.md) for dashboard consumption. Rate limiter state is maintained in a central [GenServer](@/glossary/genserver.md) with [ETS](@/glossary/ets.md)-backed token buckets.

### 4.4 External Integrations

121+ external services accessed via [REST API](@/glossary/rest-api.md)s, HTML scraping, database connections, and file downloads. Key providers include Shodan, [Censys](@/glossary/censys.md), VirusTotal, AbuseIPDB, [GreyNoise](@/glossary/greynoise.md), SecurityTrails, ARES (Czech business [registry](@/glossary/registry-otp.md)), Justice.cz (Czech commercial register), EU Sanctions List, OFAC, NVD, and crt.sh.

## 5. Performance

### 5.1 Benchmarks

| Operation | Latency | Notes |
|-----------|---------|-------|
| Single-source query | 200ms-3s | Depends on source response time |
| Multi-source parallel (5 sources) | 1-3s | Bounded by slowest source |
| Multi-source parallel (10 sources) | 2-5s | With partial result handling |
| Result fusion (deduplication) | < 50ms | In-memory processing |
| Cache hit (any source) | < 1ms | ETS L1 cache |

### 5.2 Scalability

Query throughput scales linearly with the concurrent query limit. Source queries are IO-bound (waiting for external APIs), so hundreds of concurrent queries require minimal CPU. The rate limiter ensures source compliance regardless of query volume.

### 5.3 Resource Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| Memory | 512 MB | 2 GB (with result caching) |
| CPU | 2 cores | 4 cores (for parallel queries) |
| Network | Outbound HTTPS | Moderate bandwidth (API queries) |

## 6. Testing Strategy

### 6.1 Unit Tests

Each source adapter has unit tests with recorded API responses (VCR-style cassettes) to verify parsing, normalization, and error handling without hitting live APIs. Fusion engine tests verify deduplication, confidence scoring, and provenance tracking with known multi-source inputs.

### 6.2 Integration Tests

End-to-end tests exercise the full query pipeline from facade through routing, parallel dispatch, adapter execution, and result fusion. Tests use a mock source server to verify timeout handling, partial results, and rate limit compliance.

### 6.3 Property-Based Testing

StreamData generators produce random entity names and query parameters to verify that the facade always returns structured results (never crashes), source selection is deterministic for the same inputs, and confidence scores are bounded between 0.0 and 1.0.

## 7. Security Considerations

### 7.1 Threat Model

API key exposure is the primary threat. Source credentials are stored in encrypted environment variables, never logged, and rotated periodically. Rate limit compliance prevents account suspension. Query content is logged for audit purposes but sanitized of credentials.

### 7.2 Access Control

OSINT queries require `osint_query` permission through [Prismatic Auth](@/apps/prismatic-auth.md). Query results containing personal data (sanctions matches, breach data) are subject to [GDPR](@/glossary/gdpr.md) retention policies managed through [Prismatic Compliance](@/apps/prismatic-compliance.md).

## 8. Operational Considerations

### 8.1 Deployment

Requires API credentials for each enabled source, configured via environment variables. Sources without credentials are automatically disabled. The system gracefully degrades when individual sources are unavailable.

### 8.2 Monitoring

Telemetry events: `[:prismatic, :osint, :query]`, `[:prismatic, :osint, :source_error]`, `[:prismatic, :osint, :rate_limited]`. Key metrics include per-source latency, error rates, rate limit utilization, and cache hit rates.

### 8.3 Troubleshooting

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| Source returning errors | API key expired or rate limited | Rotate credentials; check rate limit status |
| Slow multi-source queries | One source timing out | Check source health; adjust timeout |
| Low confidence scores | Few sources available | Enable additional sources; check credentials |
| Missing source data | Source adapter not loaded | Verify source configuration and credentials |

## 9. Future Work

Planned enhancements include streaming result delivery (returning partial results as sources respond), adaptive source selection based on historical accuracy, cost-optimized source routing (preferring cheaper sources when quality is comparable), and support for authenticated scanning with target authorization.

## References

- [Prismatic OSINT Network](@/apps/prismatic-osint-network.md) -- Network intelligence adapters
- [Prismatic OSINT Business](@/apps/prismatic-osint-business-financial.md) -- Business intelligence adapters
- [Prismatic OSINT Czech Legal](@/apps/prismatic-osint-czech-legal.md) -- Czech legal adapters
- [Prismatic OSINT EU Institutions](@/apps/prismatic-osint-eu-institutions.md) -- EU institutional adapters
- [Prismatic OSINT Monitoring](@/apps/prismatic-osint-monitoring.md) -- Continuous monitoring
- [Prismatic OSINT Sources](@/apps/prismatic-osint-sources.md) -- Source registry
- [Shodan](https://www.shodan.io/) -- Internet device search engine
- [Censys](https://censys.io/) -- Internet-wide scanning platform
- [VirusTotal](https://www.virustotal.com/) -- Multi-antivirus scanning service

## Related Agents

- [Competitor Researcher](@/agents/competitor-researcher.md) -- Leverages the 121+ OSINT sources to build competitive intelligence profiles across business domains
- [Alert Management Specialist](@/agents/alert-management-specialist.md) -- Routes and escalates intelligence alerts generated from OSINT source monitoring
- [Adapter Pattern Specialist](@/agents/adapter-pattern-specialist.md) -- Designs the source adapter protocol ensuring consistent integration across 121+ heterogeneous providers

## Related Capabilities

- [Intelligence Synthesis](@/capabilities/intelligence-synthesis.md) -- Multi-source result fusion with deduplication, confidence scoring, and provenance tracking
- [Real-Time Monitoring](@/capabilities/real-time-monitoring.md) -- Source health monitoring and availability tracking for continuous intelligence operations
- [NABLA Axioms](@/capabilities/nabla-axioms.md) -- Every intelligence datum carries provenance metadata and confidence levels per epistemic axioms

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)