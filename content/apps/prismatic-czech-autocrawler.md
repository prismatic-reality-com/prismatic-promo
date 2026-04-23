+++
title = "Prismatic Czech Autocrawler"
weight = 42
[extra]
icon = "flag"
color = "blue"
description = "Automated crawler for Czech government registries and public data sources"
category = "Collection"
files = "185"
status = "Development"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1028
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Czech", "Autocrawler", "Automated", "apps", "Collection", "Prismatic Platform", "PrismaticCzechAutocrawler"]
tags = ["apps", "collection", "prismatic-czech-autocrawler", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Czech Autocrawler - Prismatic Platform"
+++

## Overview

Prismatic Czech Autocrawler automates data collection from Czech government registries and public data sources, handling the specific authentication patterns, anti-bot protections, and data formats used by Czech public administration portals. Built on [Elixir](@/glossary/elixir.md)'s concurrency model and [OTP](@/glossary/otp.md) [supervision tree](@/glossary/supervision-tree.md)s, the autocrawler maintains fresh copies of registry data for offline analysis, cross-referencing, and integration with the platform's [OSINT](@/glossary/osint.md) intelligence pipeline.

The autocrawler implements intelligent incremental update detection, minimizing network traffic and registry load by tracking document hashes, modification timestamps, and registry-specific change indicators. When a Czech business registry entity changes its registered address, files new annual accounts, or undergoes ownership transfer, the autocrawler detects and captures the change within the configured polling interval. Historical version preservation ensures that all prior states of an entity's registry profile remain accessible for temporal analysis and [audit trail](@/glossary/audit-trail.md) compliance.

Data quality validation runs on every imported record, checking ICO/DIC format correctness, cross-referencing entity identifiers across multiple registries, and flagging inconsistencies for human review. The autocrawler integrates with the [Prismatic OSINT Business](@/apps/prismatic-osint-business-financial.md) adapter layer for normalized entity profile construction and with the [knowledge graph](@/glossary/knowledge-graph.md) for [entity resolution](@/glossary/entity-resolution.md) across Czech and international sources.

## Architecture

```
Scheduler --> Registry Adapter --> Response Parser --> Data Validator --> Storage
     |              |                     |                  |              |
  Cron Config   ARES/Justice/        HTML/XML/JSON       ICO/DIC        PostgreSQL
  Priorities    Insolvency/CEDR      Normalization       Cross-Check    Meilisearch
     |              |                     |                  |              |
     +-----Change Detector --> Notification Pipeline --> History Store
```

All parsing and validation logic follows [pure function](@/glossary/pure-function.md) principles. Network requests and storage writes occur only at supervision boundaries, with [rate limiting](@/glossary/rate-limiting.md) and [backpressure](@/glossary/backpressure.md) mechanisms preventing registry overload. Each registry adapter runs as an independently supervised process, ensuring that a failure in one registry's adapter cannot cascade to affect others.

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticCzechAutocrawler` | Public facade: `update/2`, `sync/2`, `freshness/0`, `entity_history/1` |
| `PrismaticCzechAutocrawler.Application` | OTP application entry point |
| `PrismaticCzechAutocrawler.CommandInterface` | CLI command interface for manual crawl operations |
| `PrismaticCzechAutocrawler.Core` | Core crawling logic and registry adapter coordination |
| `PrismaticCzechAutocrawler.L1Pattern` | Level 1 pattern matching for registry data extraction |
| `PrismaticCzechAutocrawler.L2Synthesis` | Level 2 synthesis of multi-registry entity profiles |
| `PrismaticCzechAutocrawler.L3Meta` | Level 3 meta-analysis across crawled registry data |
| `PrismaticCzechAutocrawler.MeilisearchIndexer` | Search index population for crawled entity data |
| `PrismaticCzechAutocrawler.PipelineIntegration` | Integration with platform's data pipeline infrastructure |
| `PrismaticCzechAutocrawler.ChangeDetector` | Hash-based incremental change detection per registry |
| `PrismaticCzechAutocrawler.HistoryStore` | Versioned entity state preservation for temporal analysis |

## Registry Adapters

The autocrawler integrates with six Czech government registries, each requiring a specialized adapter that handles the unique data formats, authentication mechanisms, and access patterns of its source portal:

| Registry | Frequency | Data Volume | Format | Key Data |
|----------|-----------|-------------|--------|----------|
| ARES | Daily | ~3M entities | XML/JSON | Company registration, addresses, activities |
| Justice.cz | Daily | ~800K filings | HTML | Commercial register, board composition, insolvency |
| Insolvencni rejstrik | Hourly | ~200K proceedings | REST/XML | Insolvency proceedings, creditor claims, deadlines |
| Verejne zakazky | Hourly | ~500K tenders | XML | Public procurement, contract awards, suppliers |
| Registr smluv | Hourly | ~3M contracts | JSON/PDF | Public contracts, government spending, parties |
| CEDR | Daily | ~2M subsidies | CSV/JSON | Government subsidies, EU grants, recipients |

### ICO/DIC Validation

Every entity identifier undergoes checksum validation to catch data corruption and transcription errors early in the pipeline. The ICO (Identification Number of Organization) uses a modulo-11 weighted checksum algorithm mandated by Czech law, while the DIC (Tax Identification Number) follows EU VAT number validation rules with country-specific prefixes.

```elixir
# ICO validation with checksum verification
defmodule PrismaticCzechAutocrawler.Validator do
  @doc "Validates Czech ICO format and checksum"
  @spec validate_ico(String.t()) :: {:ok, String.t()} | {:error, :invalid_checksum}
  def validate_ico(ico) when byte_size(ico) == 8 do
    weights = [8, 7, 6, 5, 4, 3, 2]
    digits = ico |> String.graphemes() |> Enum.map(&String.to_integer/1)

    sum = Enum.zip(weights, Enum.take(digits, 7))
          |> Enum.reduce(0, fn {w, d}, acc -> acc + w * d end)

    check = rem(11 - rem(sum, 11), 10)
    if check == List.last(digits), do: {:ok, ico}, else: {:error, :invalid_checksum}
  end
end
```

## Configuration

```elixir
config :prismatic_czech_autocrawler,
  registries: [:ares, :justice, :insolvency, :verejne_zakazky, :registr_smluv, :cedr],
  polling_intervals: %{
    ares: :timer.hours(24),
    justice: :timer.hours(24),
    insolvency: :timer.hours(1),
    verejne_zakazky: :timer.hours(1),
    registr_smluv: :timer.hours(1),
    cedr: :timer.hours(24)
  },
  rate_limit_per_registry: {1, :second},
  incremental_detection: true,
  history_preservation: true,
  ico_validation: true,
  max_concurrent_requests: 5,
  retry_strategy: :exponential_backoff,
  retry_max_attempts: 3
```

## API Reference

```elixir
# Run incremental update for ARES
{:ok, stats} = PrismaticCzechAutocrawler.update(:ares, mode: :incremental)
# => %{new: 142, updated: 89, unchanged: 2_999_769, errors: 0}

# Full sync for Justice.cz
{:ok, stats} = PrismaticCzechAutocrawler.sync(:justice, mode: :full)

# Check data freshness across all registries
{:ok, freshness} = PrismaticCzechAutocrawler.freshness()
# => %{ares: ~U[2026-02-14 03:00:00Z], justice: ~U[2026-02-14 02:45:00Z], ...}

# Lookup entity history across all registry snapshots
{:ok, versions} = PrismaticCzechAutocrawler.entity_history(ico: "12345678")
# => [%{registry: :ares, timestamp: ~U[...], data: %{...}}, ...]

# Trigger manual re-crawl for specific entity
{:ok, entity} = PrismaticCzechAutocrawler.refresh_entity(ico: "12345678",
  registries: [:ares, :justice])

# Get crawl statistics for monitoring
{:ok, stats} = PrismaticCzechAutocrawler.crawl_stats(period: :last_24h)
# => %{entities_processed: 142_500, errors: 12, avg_latency_ms: 450}
```

## Incremental Change Detection

The change detection system is critical to operational efficiency. Rather than re-downloading and re-parsing millions of records on every crawl cycle, the autocrawler maintains a hash digest for each entity's last known state per registry. On each polling cycle, the adapter fetches only the modification timestamps or change feeds provided by the registry, comparing against stored hashes to identify entities that require full re-download.

For registries that provide change feeds (such as ARES daily updates), the autocrawler consumes these feeds directly. For registries that do not offer change notifications, the system falls back to hash-based comparison on a rotating sample, ensuring eventual full-coverage verification without overwhelming the source portal.

## Data Quality Pipeline

Every imported record passes through a multi-stage quality pipeline that validates structural correctness, cross-references identifiers across registries, and flags anomalies for human review. The pipeline is configurable per registry, as each source presents different data quality challenges:

| Quality Check | Stage | Failure Action | Recovery |
|---------------|-------|----------------|----------|
| ICO checksum | Parsing | Reject record | Manual review |
| DIC format | Parsing | Warn, continue | Flag for correction |
| Address normalization | Enrichment | Best-effort | Geocoding fallback |
| Cross-registry consistency | Validation | Preserve both | Contradiction flagged |
| Duplicate detection | Storage | Merge with existing | History preserved |

## Testing

Registry adapter tests use HTML/XML fixtures captured from actual Czech government portals to verify extraction accuracy. ICO/DIC validation tests verify checksum algorithm correctness against known valid and invalid identifiers. Incremental detection tests verify correct change identification using document hash comparison.

Integration tests exercise the full pipeline from registry fetch through parsing, validation, and storage. Property-based tests generate random entity data to verify normalization consistency and cross-registry linking accuracy. Fixtures are version-controlled alongside the adapter code to detect when portal format changes require parser updates.

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic OSINT Business](@/apps/prismatic-osint-business-financial.md) | Normalized entity profiles from crawled registry data |
| [Prismatic OSINT Sources](@/apps/prismatic-osint-sources.md) | Registry adapters in unified OSINT source catalog |
| [Prismatic Storage Ecto](@/apps/prismatic-storage-ecto.md) | [PostgreSQL](@/glossary/postgresql.md) persistence for crawled entity data |
| [Prismatic Graph](@/apps/prismatic-graph.md) | Entity relationship mapping in the knowledge graph |
| [Prismatic Crawler Core](@/apps/prismatic-crawler-core.md) | Shared crawler infrastructure and adapter definitions |
| [Prismatic Meilisearch](@/apps/prismatic-meilisearch.md) | Full-text search indexing for crawled entities |

## NABLA Compliance

| NABLA Axiom | Autocrawler Enforcement | Implementation |
|-------------|------------------------|----------------|
| Provenance Mandatory | Every crawled record carries registry source, timestamp, and hash | Full provenance chain from registry portal to storage |
| Signal Plurality | Cross-registry validation requires multiple source corroboration | Entity profiles assembled from multiple independent registries |
| Time Decay | Historical versions enable temporal analysis | Version timestamps on all entity state changes |
| Contradiction Preservation | Cross-registry inconsistencies flagged, not resolved silently | Discrepancies surface for human review |
| Source Independence | Each registry adapter operates independently | Adapters share no state, enabling independent evaluation |

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Single entity lookup | 500ms-2s | Depends on registry response time |
| Incremental update (ARES) | 2-4 hours | ~3M entity comparison |
| ICO validation | < 1ms | Checksum algorithm |
| Entity history query | < 50ms | PostgreSQL indexed lookup |
| Full sync (Justice.cz) | 6-12 hours | ~800K filings with rate limiting |
| Meilisearch indexing | < 5s per 1K entities | Batch insert with async confirmation |

[Telemetry](@/glossary/telemetry.md) events: `[:prismatic, :czech_autocrawler, :update]`, `[:prismatic, :czech_autocrawler, :entity_changed]`, `[:prismatic, :czech_autocrawler, :validation_error]`.

## Related Resources

- [Prismatic Crawler Core](@/apps/prismatic-crawler-core.md) -- Shared crawler infrastructure
- [Prismatic OSINT Czech Legal](@/apps/prismatic-osint-czech-legal.md) -- Czech legal intelligence
- [Prismatic DD](@/apps/prismatic-dd.md) -- Due diligence workflows consuming entity profiles
- [Czech Autocrawler Supreme](@/agents/czech-autocrawler-supreme.md) -- Orchestrates crawling campaigns
- [Czech Business Intelligence Specialist](@/agents/czech-business-intelligence-specialist.md) -- Analyzes crawled data
- [Crawler Development Specialist](@/agents/crawler-development-specialist.md) -- Maintains registry adapters
- [Intelligence Synthesis](@/capabilities/intelligence-synthesis.md) -- Multi-registry evidence fusion
- [Quality Gates](@/capabilities/quality-gates.md) -- Data quality validation on imported records
- [Real-Time Monitoring](@/capabilities/real-time-monitoring.md) -- Crawler health and data freshness monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)