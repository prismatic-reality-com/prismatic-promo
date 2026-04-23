+++
title = "Prismatic OSINT Sources"
weight = 67
[extra]
icon = "squares-2x2"
color = "teal"
description = "OSINT source registry and adapter management for 121+ intelligence sources"
category = "OSINT"
files = "260"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 997
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "OSINT", "Sources", "apps", "Prismatic Platform", "Source", "PrismaticOsintSources"]
tags = ["apps", "osint", "prismatic-osint-sources", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic OSINT Sources - Prismatic Platform"
+++

## Overview

Prismatic [OSINT](@/glossary/osint.md) Sources manages the registry and lifecycle of all 121+ OSINT source adapters within the Prismatic Platform. It provides source discovery, health monitoring, capability querying, and unified access to all intelligence sources through a consistent [adapter pattern](@/glossary/adapter-pattern.md) [protocol](@/glossary/protocol.md). Every adapter implements the same [behaviour](@/glossary/behaviour.md) contract, ensuring that consumers can query any source -- from network intelligence to [threat intelligence](@/glossary/threat-intelligence.md) feeds -- through a single, uniform API without knowledge of source-specific authentication, pagination, or data format details.

The source registry maintains a capability-based catalog backed by [ETS](@/glossary/ets.md), enabling O(1) lookups when the platform needs to find all sources that support a particular query type such as IP reputation, domain intelligence, or [sanctions screening](@/glossary/sanctions-screening.md). Each source entry tracks availability status, response latency percentiles, [rate limiting](@/glossary/rate-limiting.md) quotas, and credential validity, providing the orchestration layer with real-time intelligence about which sources are healthy, cost-effective, and responsive for a given query.

Multi-source parallel querying enables the platform to fan out intelligence requests across multiple adapters simultaneously, collecting results through [OTP](@/glossary/otp.md) [supervision tree](@/glossary/supervision-tree.md) coordination and deduplicating findings with [entity resolution](@/glossary/entity-resolution.md) algorithms. Source priority ordering and cost-aware selection ensure that expensive commercial APIs are queried only when free or lower-cost sources cannot satisfy the information requirement, optimizing operational costs while maintaining intelligence completeness.

## Architecture

```
Query Request --> Source Selector --> Parallel Dispatcher --> Result Aggregator
      |                 |                     |                       |
  Capability         Priority          Per-Source Worker         Deduplication
  Requirements       Cost Model        Rate Limiter             Normalization
  Confidence         Availability      Circuit Breaker          Confidence Score
      |                 |                     |                       |
      +-----------------+---------------------+-----------------------+
                                  |
                           Source Registry (ETS) --> Health Monitor
                                  |
                           Credential Manager --> Auth Rotation
```

All source selection and result aggregation logic follows [pure function](@/glossary/pure-function.md) principles. Network requests execute in isolated worker processes with [circuit breaker](@/glossary/circuit-breaker.md) patterns and [backpressure](@/glossary/backpressure.md) mechanisms preventing cascade failures when individual sources become unavailable.

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticOsintSources` | Public facade: `list/1`, `with_capability/1`, `query/2`, `health_report/0` |
| `PrismaticOsintSources.Application` | OTP application entry point with registry and health monitor supervision |
| `PrismaticOsintSources.Registry` | ETS-backed source catalog with capability indexing and O(1) lookups |
| `PrismaticOsintSources.SourceSelector` | Cost-aware, quota-aware source selection with priority ordering |
| `PrismaticOsintSources.ParallelDispatcher` | Concurrent multi-source query execution with timeout management |
| `PrismaticOsintSources.ResultAggregator` | Cross-source result deduplication, normalization, and confidence scoring |
| `PrismaticOsintSources.HealthMonitor` | Per-source availability tracking with degradation and recovery detection |
| `PrismaticOsintSources.CredentialManager` | API key rotation, [OAuth2](@/glossary/oauth2.md) token refresh, and credential validation |
| `PrismaticOsintSources.QuotaTracker` | Token bucket rate limiting with per-source quota tracking and forecasting |

## Key Features

### Source Registry

The ETS-backed registry provides instant capability-based source discovery with structured metadata:

```elixir
defmodule PrismaticOsintSources.Registry do
  @spec register(atom(), SourceSpec.t()) :: :ok
  def register(source_id, spec) do
    :ets.insert(@registry_table, {source_id, %{
      capabilities: spec.capabilities,
      status: :healthy,
      latency_p50: 0,
      latency_p99: 0,
      quota: spec.quota,
      cost_tier: spec.cost_tier,
      auth_type: spec.auth_type,
      registered_at: DateTime.utc_now()
    }})
    :ok
  end

  @spec with_capability(atom()) :: list(atom())
  def with_capability(capability) do
    :ets.foldl(fn {source_id, meta}, acc ->
      if capability in meta.capabilities, do: [source_id | acc], else: acc
    end, [], @registry_table)
  end

  @spec healthy_sources() :: list(atom())
  def healthy_sources do
    :ets.foldl(fn {source_id, meta}, acc ->
      if meta.status in [:healthy, :degraded], do: [source_id | acc], else: acc
    end, [], @registry_table)
  end
end
```

- Centralized catalog of all 121+ OSINT sources with capability metadata and health status
- Capability-based source discovery enabling queries like "find all sources supporting IP reputation lookup"
- Health monitoring and availability tracking with automatic source degradation and recovery detection
- Rate limit management per source with token bucket algorithms and quota tracking

### Adapter Protocol

Every OSINT source adapter must implement the `SourceAdapter` behaviour, ensuring consistent interfaces:

| Callback | Purpose | Return Type |
|----------|---------|-------------|
| `capabilities/0` | Declare supported query types | `list(atom())` |
| `query/2` | Execute a query against the source | `{:ok, list(Finding.t())} | {:error, term()}` |
| `health_check/0` | Verify source availability | `:healthy | :degraded | :unavailable` |
| `rate_limit/0` | Report current quota status | `%{remaining: integer(), resets_at: DateTime.t()}` |
| `normalize/1` | Convert source response to common schema | `{:ok, NormalizedResult.t()}` |

- Unified [protocol](@/glossary/protocol.md) interface for all OSINT queries with structured request/response contracts
- Structured result normalization converting source-specific formats to platform-standard schemas
- Error handling with source-specific context including retry recommendations and degradation status
- Credential and authentication management supporting API keys, [OAuth2](@/glossary/oauth2.md), and certificate-based auth

### Source Orchestration

- Multi-source parallel querying with configurable concurrency limits and timeout policies
- Result deduplication across sources using [entity resolution](@/glossary/entity-resolution.md) and [confidence scoring](@/glossary/confidence-scoring.md)
- Source priority and fallback ordering with cost-aware selection minimizing API expenditure
- [Telemetry](@/glossary/telemetry.md) emission for query latency, source utilization, and cache hit [metrics](@/glossary/metrics.md)

### Cost Optimization

The cost model ensures that expensive commercial APIs are queried only when necessary:

| Cost Tier | Sources | Query Strategy | Examples |
|-----------|---------|---------------|----------|
| Free | Public APIs, open databases | Always query first | crt.sh, NVD, OFAC |
| Low | Freemium with generous quotas | Preferred after free tier | Shodan (free plan), VirusTotal |
| Medium | Commercial with moderate quotas | Query when free/low insufficient | SecurityTrails, BinaryEdge |
| High | Premium commercial APIs | Query only for high-priority requests | Censys Enterprise, IntelX |

## Source Categories

| Category | Sources | Examples |
|----------|---------|---------|
| Network Intelligence | 15+ | Shodan, Censys, BinaryEdge |
| Domain/DNS | 10+ | SecurityTrails, WHOIS, crt.sh |
| Threat Intelligence | 12+ | VirusTotal, OTX, ThreatFox |
| Business/Financial | 8+ | ARES, Open Corporates, OFAC |
| Czech Registries | 15+ | Justice.cz, CEDR, RZP |
| Breach/Leak | 5+ | HIBP, DeHashed, IntelX |
| Vulnerability | 6+ | NVD, Exploit-DB, OSV |

## Usage

```elixir
# List all available sources with health status
{:ok, sources} = PrismaticOsintSources.list(include_health: true)
# => [%{name: "shodan", status: :healthy, latency_p99: 230}, ...]

# Query by capability
{:ok, sources} = PrismaticOsintSources.with_capability(:ip_lookup)
# => [%{name: "shodan"}, %{name: "censys"}, %{name: "binary_edge"}]

# Unified multi-source query with parallel execution
{:ok, results} = PrismaticOsintSources.query("example.com",
  sources: [:shodan, :censys, :crtsh],
  parallel: true,
  deduplicate: true
)
# => %{findings: [...], sources_queried: 3, confidence: 0.89}

# Check source health across all adapters
{:ok, health} = PrismaticOsintSources.health_report()
# => %{healthy: 98, degraded: 3, unavailable: 2, total: 103}

# Register a new source adapter
:ok = PrismaticOsintSources.register(:new_source, %{
  capabilities: [:ip_lookup, :domain_lookup],
  cost_tier: :low,
  auth_type: :api_key
})
```

## NABLA Compliance

| NABLA Axiom | Source Registry Enforcement | Implementation |
|-------------|---------------------------|----------------|
| Provenance Mandatory | Every finding traceable to specific source adapter | Source ID and query timestamp on all results |
| Signal Plurality | Multi-source queries enforced for reliable intelligence | SourceSelector enforces minimum source count per query type |
| Source Independence | Each adapter operates in isolation | Per-source supervised process, independent credentials, separate rate limits |
| Time Decay | Source data freshness tracked and reported | Health monitor tracks last successful query and data age per source |
| Contradiction Preservation | Conflicting results from different sources preserved | ResultAggregator maintains per-source findings without forced resolution |

## Testing

Registry tests verify ETS-backed source registration, capability indexing, and O(1) lookup performance. Source selection tests verify cost optimization, quota awareness, and plurality enforcement. Parallel dispatcher tests verify concurrent query execution, timeout handling, and error isolation across sources.

Health monitoring tests verify degradation detection, recovery triggering, and alert emission. Integration tests exercise the full pipeline from capability query through parallel dispatch to deduplicated result aggregation. Adapter contract tests verify behaviour compliance across all 121+ source adapters.

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic OSINT Core](@/apps/prismatic-osint-core.md) | Core OSINT infrastructure consuming source registry data for query routing |
| [Prismatic OSINT Business](@/apps/prismatic-osint-business-financial.md) | Business intelligence adapters registered as sources |
| [Prismatic OSINT EU Institutions](@/apps/prismatic-osint-eu-institutions.md) | EU data adapters registered in the unified source catalog |
| [Prismatic OSINT Network](@/apps/prismatic-osint-network.md) | Network intelligence adapters for [attack surface](@/glossary/attack-surface.md) discovery |
| [Prismatic Perimeter](@/apps/prismatic-perimeter.md) | [EASM](@/glossary/easm.md) consuming multi-source intelligence for [security rating](@/glossary/security-rating.md) |
| [Prismatic Storage ETS](@/apps/prismatic-storage-ets.md) | [ETS](@/glossary/ets.md)-backed source registry with sub-millisecond lookups |

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Source registry lookup | < 1ms | ETS-backed O(1) capability query |
| Capability-based discovery | < 5ms | ETS fold across registry |
| Health report generation | < 10ms | Aggregation across all sources |
| Parallel multi-source query | 1-10s | Depends on slowest source |
| Result deduplication | < 100ms | Entity resolution across source results |
| Credential rotation | < 50ms | Token refresh with cached fallback |

[Telemetry](@/glossary/telemetry.md) events: `[:prismatic, :osint_sources, :query_dispatched]`, `[:prismatic, :osint_sources, :source_health_changed]`, `[:prismatic, :osint_sources, :quota_consumed]`.

## Related Resources

- [Prismatic Czech Autocrawler](@/apps/prismatic-czech-autocrawler.md) -- Czech registry adapters consuming the source protocol
- [Cross Pollination Specialist](@/agents/cross-pollination-specialist.md) -- Cross-domain intelligence synthesis leveraging source diversity
- [Business Financial Intelligence Specialist](@/agents/business-financial-intelligence-specialist.md) -- Business source selection and analysis coordination
- [Crawler Development Specialist](@/agents/crawler-development-specialist.md) -- Source adapter development and maintenance
- [Intelligence Synthesis](@/capabilities/intelligence-synthesis.md) -- Multi-source evidence fusion and deduplication
- [NABLA Axioms](@/capabilities/nabla-axioms.md) -- Source independence and signal plurality enforcement
- [Real-Time Monitoring](@/capabilities/real-time-monitoring.md) -- Source health monitoring and availability tracking

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)