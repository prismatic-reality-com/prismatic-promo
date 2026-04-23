+++
title = "Prismatic OSINT Business"
weight = 32
[extra]
icon = "building-office"
color = "emerald"
description = "Business and financial OSINT adapters - company data, sanctions, and financial intelligence"
category = "OSINT"
files = "310"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1045
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "OSINT", "Business", "apps", "Prismatic Platform", "PrismaticOsintBusiness", "Sanctions", "Multi", "Czech", "Corporate"]
tags = ["apps", "osint", "prismatic-osint-business", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic OSINT Business - Prismatic Platform"
+++

## Overview

Prismatic [OSINT](@/glossary/osint.md) Business provides [adapter pattern](@/glossary/adapter-pattern.md) implementations for business and financial intelligence sources, integrating with corporate registries, [sanctions screening](@/glossary/sanctions-screening.md) databases, financial disclosure systems, and business intelligence platforms to build comprehensive entity profiles for due diligence and risk assessment. Each adapter normalizes source-specific data formats into the platform's unified [entity resolution](@/glossary/entity-resolution.md) schema, enabling cross-source correlation through the [knowledge graph](@/glossary/knowledge-graph.md).

The application implements multi-registry company verification, cross-referencing entity identifiers (ICO, DUNS, LEI, registration numbers) across Czech, European, and global corporate registries to build verified entity profiles with [confidence scoring](@/glossary/confidence-scoring.md) derived from the platform's [NABLA epistemic framework](@/glossary/nabla-infinity.md). When multiple registries provide conflicting data about an entity's status, ownership, or address, the system preserves both signals following the [contradiction preservation](@/glossary/contradiction-preservation.md) axiom rather than arbitrarily choosing one source over another.

Sanctions screening integrates OFAC, EU consolidated, and UN sanctions lists through a unified screening API that supports fuzzy name matching, alias resolution, and date-of-birth verification for natural persons. Corporate structure mapping traces parent-subsidiary relationships across jurisdictions, enabling risk propagation analysis where a sanctioned parent entity's risk status cascades to its subsidiaries with distance-weighted [risk score](@/glossary/risk-score.md) attenuation.

## Architecture

```
Query Router --> Source Adapter --> Response Parser --> Entity Normalizer --> Profile Store
      |               |                   |                    |                    |
  Multi-Registry   ARES/Justice       JSON/XML/HTML        Unified Schema      PostgreSQL
  Parallel Query   Open Corporates    Normalization        Cross-Reference     Knowledge Graph
  Cost Optimizer   OFAC/EU/UN         Validation           Confidence Score    Meilisearch
      |               |                   |                    |                    |
      +---------------+-------------------+--------------------+--------------------+
                                       |
                                Sanctions Screener --> Fuzzy Name Matcher
                                       |
                                Structure Mapper --> Ownership Graph
```

All parsing and entity normalization follows [pure function](@/glossary/pure-function.md) principles. Network requests execute in isolated processes under the [OTP](@/glossary/otp.md) [supervision tree](@/glossary/supervision-tree.md) with [rate limiting](@/glossary/rate-limiting.md) and [circuit breaker](@/glossary/circuit-breaker.md) patterns per source. Source credential management handles API key rotation and [OAuth2](@/glossary/oauth2.md) token refresh automatically.

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticOsintBusiness` | Public facade: `company_profile/1`, `sanctions_check/2`, `verify_entity/1`, `corporate_structure/1` |
| `PrismaticOsintBusiness.Application` | OTP application entry point with adapter supervisor |
| `PrismaticOsintBusiness.QueryRouter` | Multi-registry parallel query orchestration with cost optimization |
| `PrismaticOsintBusiness.SanctionsScreener` | Unified sanctions screening across OFAC, EU, and UN lists |
| `PrismaticOsintBusiness.FuzzyMatcher` | Fuzzy name matching with transliteration, alias resolution, and phonetic comparison |
| `PrismaticOsintBusiness.StructureMapper` | Corporate ownership chain traversal and parent-subsidiary mapping |
| `PrismaticOsintBusiness.EntityNormalizer` | Source-specific data normalization to unified entity schema |
| `PrismaticOsintBusiness.RiskPropagator` | Sanctions and risk score cascading through corporate ownership graphs |
| `PrismaticOsintBusiness.CredentialManager` | API key rotation, OAuth2 token refresh, and rate limit tracking |

## Key Features

### Company Intelligence

Multi-registry verification ensures that entity data is corroborated across independent sources before being established as fact:

```elixir
defmodule PrismaticOsintBusiness.QueryRouter do
  @spec verify_entity(keyword()) :: {:ok, VerifiedEntity.t()} | {:error, term()}
  def verify_entity(opts) do
    sources = Keyword.get(opts, :sources, [:ares, :justice, :open_corporates])
    identifier = extract_identifier(opts)

    results = Task.async_stream(sources, fn source ->
      {source, query_source(source, identifier)}
    end, max_concurrency: length(sources), timeout: 10_000)
    |> Enum.reduce(%{}, fn {:ok, {source, result}}, acc ->
      Map.put(acc, source, result)
    end)

    case EntityNormalizer.merge_and_score(results) do
      {:ok, entity} ->
        {:ok, %VerifiedEntity{
          entity: entity,
          sources: Map.keys(results),
          consistency: compute_consistency(results),
          discrepancies: detect_discrepancies(results),
          confidence: compute_confidence(results)
        }}

      {:error, reason} ->
        {:error, {:verification_failed, reason}}
    end
  end
end
```

- Multi-registry company search and verification across Czech (ARES, Justice.cz), European (Open Corporates), and global sources
- Officer and director identification with cross-registry verification and historical appointment tracking
- Corporate structure mapping tracing parent/subsidiary relationships across jurisdictions with ownership percentage tracking
- Filing and disclosure tracking including annual accounts, ownership changes, and regulatory submissions

### Financial Intelligence

- Sanctions screening across OFAC, EU, and UN lists with fuzzy name resolution and alias matching
- PEP (Politically Exposed Person) identification through regulatory and public source cross-referencing
- Adverse media monitoring for negative news, regulatory actions, and enforcement proceedings
- Financial statement analysis with key ratio extraction and temporal trend detection

### Sanctions Screening Engine

The sanctions screening engine implements multi-list fuzzy matching with configurable thresholds and evidence-based result classification:

| Sanctions List | Update Frequency | Matching Method | Coverage |
|---------------|-----------------|-----------------|----------|
| OFAC SDN | Daily | Fuzzy name + alias + DOB | US designations |
| EU Consolidated | Daily | Transliteration + fuzzy | EU restrictive measures |
| UN Security Council | Weekly | Multi-language name match | Global designations |
| HMT (UK) | Daily | Name + address verification | UK sanctions |
| SECO (Swiss) | Weekly | Name matching | Swiss regulations |

### Czech Business Sources

- ARES integration (business registry) with full entity profile extraction and real-time availability
- Justice.cz (commercial register) access for corporate filings, board composition, and insolvency status
- RZP (trade license register) for professional qualification and activity verification
- CEDR (subsidy tracking) for government grant and support payment monitoring

### Cross-Registry Verification

- Entity identity verification through multi-source cross-referencing with weighted confidence scores
- Automated detection of inconsistencies between registry sources with [audit trail](@/glossary/audit-trail.md) documentation
- [Entity resolution](@/glossary/entity-resolution.md) algorithms handling name variations, transliterations, and legal form differences
- [Telemetry](@/glossary/telemetry.md) emission for verification latency, match rates, and source utilization [metrics](@/glossary/metrics.md)

### Risk Propagation Through Ownership Graphs

When a sanctioned entity is identified, the risk score propagates through the corporate ownership graph with distance-weighted attenuation:

```elixir
defmodule PrismaticOsintBusiness.RiskPropagator do
  @spec propagate(String.t(), float(), keyword()) :: {:ok, list(map())} | {:error, term()}
  def propagate(entity_id, base_risk, opts \\ []) do
    max_depth = Keyword.get(opts, :max_depth, 5)
    attenuation = Keyword.get(opts, :attenuation, 0.7)

    graph = PrismaticGraph.ownership_subgraph(entity_id, depth: max_depth)

    propagated = traverse_and_score(graph, entity_id, base_risk, attenuation, 0)

    {:ok, Enum.map(propagated, fn {id, score, path} ->
      %{entity_id: id, propagated_risk: score, distance: length(path), path: path}
    end)}
  end
end
```

## Integrated Sources

| Source | Data Type | Key Capability | Rate Limit |
|--------|-----------|----------------|------------|
| Open Corporates | Company | Global corporate data across 140+ jurisdictions | 500/day (free) |
| Crunchbase | Business | Startup funding, investors, and acquisition data | 200/day |
| OFAC | Sanctions | US sanctions screening with SDN list | Unlimited (public) |
| EU Sanctions | Sanctions | EU consolidated restrictive measures | Unlimited (public) |
| ARES | Company | Czech business registry with full entity profiles | 1000/hour |
| CEDR | Financial | Czech subsidy tracking and grant monitoring | 500/hour |

## Usage

```elixir
# Full company profile from multiple registries
{:ok, profile} = PrismaticOsintBusiness.company_profile(ico: "12345678")
# => %{name: "Example s.r.o.", registries: [:ares, :justice], confidence: 0.96}

# Sanctions screening with fuzzy matching
{:ok, result} = PrismaticOsintBusiness.sanctions_check("Entity Name",
  lists: [:ofac, :eu, :un], threshold: 0.85)
# => %{matches: [...], clear: true, screening_id: "scr_..."}

# Cross-registry entity verification
{:ok, verified} = PrismaticOsintBusiness.verify_entity(
  name: "Example s.r.o.",
  ico: "12345678",
  sources: [:ares, :justice, :open_corporates]
)
# => %{verified: true, consistency: 0.94, discrepancies: []}

# Corporate structure discovery
{:ok, structure} = PrismaticOsintBusiness.corporate_structure(ico: "12345678")
# => %{parent: nil, subsidiaries: [...], ownership_depth: 3, total_entities: 12}

# PEP screening with evidence
{:ok, pep_result} = PrismaticOsintBusiness.pep_check("Person Name",
  jurisdiction: :cz, include_family: true)
```

## NABLA Compliance

| NABLA Axiom | Business OSINT Enforcement | Implementation |
|-------------|---------------------------|----------------|
| Provenance Mandatory | Every data point traceable to source registry | Source identifier and retrieval timestamp on all records |
| Signal Plurality | Entity verification requires multi-registry corroboration | QueryRouter queries minimum 2 independent sources |
| Contradiction Preservation | Conflicting registry data preserved without resolution | Discrepancies tracked and presented alongside confidence scores |
| Source Independence | Each registry adapter operates independently | Per-source process isolation with independent rate limiting |
| Time Decay | Registry data freshness tracked with staleness warnings | Temporal metadata enables freshness-based confidence adjustment |

## Testing

Company profile tests verify multi-registry data merging, entity normalization accuracy, and confidence score computation against known entity fixtures. Sanctions screening tests verify fuzzy matching accuracy, false positive rates, and list update handling. Corporate structure tests verify ownership chain traversal, risk propagation attenuation, and cycle detection in ownership graphs.

Integration tests exercise the full pipeline from multi-registry query through entity normalization to profile storage. Property-based tests generate random entity names with variations to verify fuzzy matching stability and consistency.

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic OSINT Sources](@/apps/prismatic-osint-sources.md) | Business adapters registered in the unified OSINT source catalog |
| [Prismatic OSINT EU Institutions](@/apps/prismatic-osint-eu-institutions.md) | EU sanctions and financial data complementing business intelligence |
| [Prismatic Czech Autocrawler](@/apps/prismatic-czech-autocrawler.md) | Czech registry data feeding business entity profiles |
| [Prismatic Graph](@/apps/prismatic-graph.md) | Entity relationship mapping in the [knowledge graph](@/glossary/knowledge-graph.md) |
| [Prismatic DD](@/apps/prismatic-dd.md) | Due diligence workflows consuming business intelligence profiles |
| [Prismatic Compliance](@/apps/prismatic-compliance.md) | [Compliance framework](@/glossary/compliance-framework.md) assessment using sanctions screening data |

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Single-registry query | 200ms-2s | Depends on source API response time |
| Multi-registry verification | 1-5s | Parallel queries across 3+ registries |
| Sanctions screening | 500ms-3s | Fuzzy matching across all lists |
| Corporate structure discovery | 2-10s | Depends on ownership graph depth |
| Entity normalization | < 50ms | Pure function transformation |
| Risk propagation | 100ms-1s | Depends on graph traversal depth |

[Telemetry](@/glossary/telemetry.md) events: `[:prismatic, :osint_business, :profile_built]`, `[:prismatic, :osint_business, :sanctions_screened]`, `[:prismatic, :osint_business, :entity_verified]`.

## Related Resources

- [Prismatic OSINT Core](@/apps/prismatic-osint-core.md) -- Core OSINT infrastructure shared across all source adapters
- [Business Financial Intelligence Specialist](@/agents/business-financial-intelligence-specialist.md) -- Coordinates business intelligence analysis workflows
- [Czech Business Intelligence Specialist](@/agents/czech-business-intelligence-specialist.md) -- Specialized Czech business data analysis and verification
- [Competitor Researcher](@/agents/competitor-researcher.md) -- Competitive intelligence leveraging business source data
- [Intelligence Synthesis](@/capabilities/intelligence-synthesis.md) -- Multi-source business evidence fusion for entity profiling
- [NABLA Axioms](@/capabilities/nabla-axioms.md) -- Contradiction preservation and confidence scoring for business data
- [Quality Gates](@/capabilities/quality-gates.md) -- Data quality validation enforcement on business intelligence

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)