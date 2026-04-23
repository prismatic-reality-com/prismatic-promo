+++
title = "/czech-autocrawler-supreme"
weight = 2110
[extra]
category = "Intelligence"
description = "3NL Czech Registry Autocrawler with AIAD integration for business intelligence"
syntax = "/czech-autocrawler-supreme [options]"
authority = "L3"
agent = "czech-autocrawler"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 878
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["czech-autocrawler-supreme", "Czech", "Registry", "Autocrawler", "AIAD", "commands", "Intelligence", "Prismatic Platform", "Meilisearch", "OSINT"]
tags = ["commands", "intelligence", "czech-autocrawler-supreme", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/czech-autocrawler-supreme - Prismatic Platform"
+++

## Overview

The **/czech-autocrawler-supreme** command orchestrates autonomous business intelligence gathering from Czech government registries using a [3NL](@/glossary/three-nl.md) (3-Layer Neural Learning) architecture with [AIAD](@/glossary/aiad.md) agent coordination. Czech Republic business registries -- ARES (Administrative Register of Economic Subjects), Justice.cz (Commercial Register), and CUZK (Czech Office for Surveying, Mapping and Cadastre) -- contain authoritative data on corporate entities, ownership structures, property holdings, and business relationships. This command automates the systematic extraction, cross-referencing, and indexing of that intelligence.

The 3NL architecture provides three processing layers: L1 Pattern Recognition handles Czech-specific data validation, HTML parsing, and quality assessment; L2 Knowledge Synthesis performs entity resolution, deduplication, and relationship mapping across registries; L3 Meta-Learning optimizes crawling strategies, predicts performance, and detects data anomalies. Together, these layers transform raw registry data into structured, searchable business intelligence with measurable quality metrics.

This command operates under the **L3** authority level and is executed by the `czech-autocrawler` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the AIAD (Autonomous Intelligence Agent Design) standard. The command coordinates multiple specialized agents across all three neural layers and integrates with [Meilisearch](@/glossary/meilisearch.md) for real-time search indexing of discovered entities.

Business intelligence gathered through this command feeds into the broader [OSINT](@/glossary/osint.md) capability of the Prismatic Platform, providing corporate structure analysis, beneficial ownership investigations, and regulatory compliance verification. All operations comply with GDPR data protection requirements and respect each registry's terms of service and rate limiting policies.

## Architecture

### 3NL Processing Pipeline

```
CZECH REGISTRY SOURCES
======================

ARES (ICO/DICO lookup)  +  Justice.cz (Company records)  +  CUZK (Cadastral data)
         |                           |                            |
         v                           v                            v
    +------------------------------------------------------------+
    |           L1: PATTERN RECOGNITION LAYER                     |
    |  +-- Czech identifier validation (ICO, DICO, RC)           |
    |  +-- HTML/XML parsing and data extraction                   |
    |  +-- Quality assessment and confidence scoring              |
    |  +-- Rate limit management and request scheduling           |
    +------------------------------------------------------------+
                              |
                              v
    +------------------------------------------------------------+
    |           L2: KNOWLEDGE SYNTHESIS LAYER                     |
    |  +-- Cross-registry entity resolution                      |
    |  +-- Deduplication with fuzzy matching                      |
    |  +-- Relationship mapping (ownership, management)          |
    |  +-- Data enrichment and gap filling                       |
    +------------------------------------------------------------+
                              |
                              v
    +------------------------------------------------------------+
    |           L3: META-LEARNING LAYER                           |
    |  +-- Crawling strategy optimization                        |
    |  +-- Performance prediction and resource planning          |
    |  +-- Anomaly detection in entity data                      |
    |  +-- Quality threshold adaptive adjustment                 |
    +------------------------------------------------------------+
                              |
                              v
    +------------------------------------------------------------+
    |           MEILISEARCH INDEX                                 |
    |  +-- Real-time entity indexing                              |
    |  +-- Full-text search across all fields                    |
    |  +-- Faceted search (region, industry, size)               |
    |  +-- Relationship-based queries                            |
    +------------------------------------------------------------+
```

### Agent Coordination

| Agent | Layer | Role |
|-------|-------|------|
| `czech-autocrawler-supreme` | Supreme | Orchestrator coordinating all layers |
| `l1-pattern-engine` | L1 | Czech data validation and extraction |
| `l2-entity-resolver` | L2 | Cross-registry entity resolution |
| `l3-strategy-optimizer` | L3 | Crawling strategy and performance optimization |

## Usage

### Discovery Mode (Default)

```bash
# Start discovery mode with default settings
# Sources: all registries, batch size: 100, real-time indexing, 80% quality threshold
/czech-autocrawler-supreme

# Discovery focused on specific registry
/czech-autocrawler-supreme --mode discovery --sources ares

# Discovery with custom batch size
/czech-autocrawler-supreme --mode discovery --batch-size 200
```

### Enrichment Mode

```bash
# Enrich existing entities from ARES and Justice.cz
/czech-autocrawler-supreme --mode enrichment --sources ares,justice --batch-size 50

# Targeted enrichment of specific entity
/czech-autocrawler-supreme --mode enrichment --target ICO:12345678
```

### Validation Mode

```bash
# Validate data quality with strict threshold
/czech-autocrawler-supreme --mode validation --quality-threshold 0.9

# Validation with comprehensive reporting
/czech-autocrawler-supreme --mode validation --quality-threshold 0.85 --verbose
```

### Full Processing Mode

```bash
# Full pipeline: discovery + enrichment + validation
/czech-autocrawler-supreme --mode full --batch-size 250 --indexing batch

# Full mode with CUZK focus for real estate intelligence
/czech-autocrawler-supreme --mode full --sources cuzk --quality-threshold 0.75
```

## Options & Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| **--mode** | enum | No | `discovery` | Operation mode: discovery, enrichment, validation, full |
| **--sources** | array | No | `ares,justice,cuzk` | Registry sources to crawl |
| **--batch-size** | integer | No | 100 | Entities per batch (1-500) |
| **--indexing** | enum | No | `realtime` | Indexing mode: realtime, batch, disabled |
| **--quality-threshold** | float | No | 0.8 | Minimum quality score (0.0-1.0) |
| **--target** | string | No | -- | Specific entity identifier (ICO:XXXXXXXX) |
| **--verbose** | boolean | No | false | Show detailed processing output |

## Execution Flow

```
/czech-autocrawler-supreme [options]
    |
    v
PHASE 1: INITIALIZATION (< 5s)
    +-- Activate czech-autocrawler-supreme agent
    +-- Initialize 3NL layers (L1, L2, L3)
    +-- Establish registry connections
    +-- Configure Meilisearch index and schema
    +-- Load L3 strategy optimization state
    |
    v
PHASE 2: DISCOVERY & PROCESSING (variable)
    +-- L1: Pattern recognition across registries
    +-- L1: Czech identifier validation (ICO, DICO)
    +-- L2: Cross-registry entity resolution
    +-- L2: Relationship mapping (ownership chains)
    +-- L3: Strategy optimization based on throughput
    +-- L3: Performance prediction and adjustment
    |
    v
PHASE 3: INDEXING & REPORTING (< 10s per batch)
    +-- Stream processed entities to Meilisearch
    +-- Generate quality assessment reports
    +-- Track throughput and error metrics
    +-- Update GitLab milestone progress
    |
    v
PHASE 4: COMPLETION
    +-- Final quality metrics summary
    +-- Relationship graph statistics
    +-- Performance analytics report
    +-- Next crawl recommendations
```

### Output Structure

```json
{
  "status": "success",
  "crawl_id": "czreg_1703347200_a1b2c3d4",
  "summary": {
    "entities_discovered": 1250,
    "entities_processed": 1200,
    "entities_indexed": 1195,
    "quality_score": 0.92,
    "processing_time_ms": 45000,
    "registries_used": ["ares", "justice", "cuzk"]
  },
  "quality_metrics": {
    "completeness": 0.95,
    "accuracy": 0.94,
    "consistency": 0.89,
    "freshness": 0.98
  },
  "relationships": {
    "ownership_chains": 45,
    "management_links": 128,
    "business_partnerships": 67
  }
}
```

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Multi-agent coordination | 4 agents across 3NL layers |
| [AIAD](@/glossary/aiad.md) Registry | Command specification | Supreme coordination category |
| [Meilisearch](@/glossary/meilisearch.md) | Real-time search indexing | `czech_business_entities` index |
| [Quality Gates](@/glossary/quality-gates.md) | Data quality enforcement | Quality threshold gating |
| [Telemetry](@/glossary/telemetry.md) | Performance [metrics](@/glossary/metrics.md) | Throughput and error rate tracking |
| GitLab Milestones | Project management | Milestone MS-6250279 progress tracking |
| [OSINT](@/glossary/osint.md) Pipeline | Intelligence integration | Feeds into broader OSINT capability |

### Registry Integration Details

| Registry | API Type | Data Provided | Rate Limit |
|----------|----------|---------------|------------|
| **ARES** | REST/XML | Company identification, industry codes, addresses | Adaptive |
| **Justice.cz** | HTML scraping | Commercial register entries, ownership, management | Respectful crawling |
| **CUZK** | REST/SOAP | Property ownership, cadastral data, land records | Strict limits |

## Best Practices

1. **Start with discovery mode** -- Begin with default discovery settings to establish a baseline entity set before running enrichment or validation passes.

2. **Respect registry rate limits** -- The L3 strategy optimizer manages rate limiting automatically. Do not increase batch sizes beyond 250 without confirming registry capacity.

3. **Use quality thresholds appropriate to the data source** -- ARES data is highly structured (0.9 threshold appropriate), while CUZK data may require lower thresholds (0.75) due to format variations.

4. **Monitor L3 optimization** -- The meta-learning layer continuously improves crawling strategies. Allow multiple runs for the optimizer to converge on optimal parameters.

5. **Validate before enrichment** -- Run validation mode to assess data quality before investing time in enrichment operations.

6. **Index in batch mode for large crawls** -- Real-time indexing adds overhead. For batch sizes above 200, use `--indexing batch` for better throughput.

## Error Handling

| Error Code | Description | Recovery |
|------------|-------------|----------|
| `REGISTRY_UNAVAILABLE` | Target registry temporarily offline | Automatic retry with exponential backoff; partial results from available registries |
| `RATE_LIMIT_EXCEEDED` | Exceeded registry rate limit | L3 optimizer reduces request frequency; automatic cooldown |
| `ENTITY_RESOLUTION_CONFLICT` | Ambiguous entity matching across registries | Manual review queued; confidence score below threshold |
| `INDEX_WRITE_FAILURE` | Meilisearch indexing error | Retry indexing; check Meilisearch health via `/deploy-meilisearch` |
| `QUALITY_THRESHOLD_FAILURE` | Batch quality below threshold | Report generated; entities held for review |
| `AUTHENTICATION_FAILURE` | Registry API key invalid or expired | Check API credentials; rotate keys |

### Graceful Degradation

When one registry becomes unavailable, the system continues processing with available sources:

```json
{
  "status": "partial_success",
  "failed_registries": ["ares"],
  "successful_registries": ["justice", "cuzk"],
  "partial_results": {
    "entities_processed": 450,
    "entities_indexed": 445
  },
  "recovery_actions": [
    "Retry ARES connection in 5 minutes",
    "Continue with available registries",
    "Enable automatic retry with exponential backoff"
  ]
}
```

## Advanced Usage

### Custom Registry Configuration

```elixir
# Configure custom registry endpoints
config :prismatic_intelligence, :czech_registries,
  ares: %{
    base_url: "https://wwwinfo.mfcr.cz/cgi-bin/ares",
    timeout: 30_000,
    max_concurrent: 5
  },
  justice: %{
    base_url: "https://or.justice.cz",
    timeout: 60_000,
    max_concurrent: 2
  },
  cuzk: %{
    base_url: "https://services.cuzk.cz",
    timeout: 45_000,
    max_concurrent: 3
  }
```

### Relationship Graph Queries

```elixir
# Query ownership chains for an entity
{:ok, chains} = PrismaticIntelligence.CzechRegistry.ownership_chains("ICO:12345678")

# Map management connections
{:ok, network} = PrismaticIntelligence.CzechRegistry.management_network("ICO:12345678", depth: 3)

# Find beneficial owners
{:ok, owners} = PrismaticIntelligence.CzechRegistry.beneficial_owners("ICO:12345678")
```

### Scheduled Crawling

```elixir
# Configure scheduled crawling via Quantum
config :prismatic_intelligence, PrismaticIntelligence.Scheduler,
  jobs: [
    {"0 2 * * *", {PrismaticIntelligence.CzechAutocrawler, :discovery, [batch_size: 500]}},
    {"0 6 * * 1", {PrismaticIntelligence.CzechAutocrawler, :validation, [threshold: 0.9]}}
  ]
```

## Security & Compliance

| Requirement | Implementation |
|-------------|----------------|
| **GDPR Compliance** | Personal data handled per EU regulations; anonymization available |
| **Registry TOS** | Full compliance with each registry's terms of service |
| **Data Encryption** | TLS for all registry communications; encrypted storage at rest |
| **Audit Logging** | Comprehensive logging of all data access and processing |
| **Rate Limiting** | Respectful crawling with adaptive rate management |
| **Access Control** | L3 authority required; role-based parameter access |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for data quality below threshold. Entities failing quality checks are rejected, not approximated. Complete crawl execution or documented partial results -- no silent failures.
- **NO DOUBTS**: Multi-source cross-verification through L2 entity resolution. Quality metrics measured, not estimated. NABLA signal plurality enforced through multi-registry confirmation of entity identity.

## Related Commands

- [/investigate](@/commands/investigate.md) - Launch comprehensive [OSINT](@/glossary/osint.md) investigation across 121+ sources
- [/email-osint](@/commands/email-osint.md) - Email-based OSINT gathering with breach correlation and social profiling
- [/google-hacking](@/commands/google-hacking.md) - Google dorking and advanced search intelligence extraction
- [/deploy-meilisearch](@/commands/deploy-meilisearch.md) - Meilisearch instance deployment and configuration
- [/delta-force](@/commands/delta-force.md) - Precision strike intelligence with targeted collection and analysis
- [/agents](@/commands/agents.md) - List and manage agent ecosystem with status monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)