+++
title = "Due Diligence Investigation Techniques"
weight = 11
[extra]
description = "Comprehensive guide to conducting due diligence investigations using the Prismatic DD Platform with entity resolution, graph analysis, and triple-check validation"
category = "advanced"
difficulty = "advanced"
duration = "70 min"
prerequisites = ["agent-orchestration", "storage-patterns", "liveview-dashboards"]
glossary_terms = ["due-diligence", "kyc", "aml", "entity-resolution", "beneficial-ownership", "sanctions-screening", "triple-check", "risk-score"]
technologies = ["elixir", "phoenix-liveview", "postgresql", "kuzudb", "meilisearch"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1244
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Due", "Diligence", "Investigation", "Techniques", "Comprehensive", "Prismatic", "Platform", "academy", "advanced", "Prismatic Platform"]
tags = ["academy", "advanced", "due-diligence-investigation-techniques", "prismatic"]
quality_score = 80
see_also = ["glossary", "capabilities", "technologies"]
image = "/images/sections/academy.png"
image_alt = "Due Diligence Investigation Techniques - Prismatic Platform"
+++

## Overview

The Prismatic DD Platform is the platform's purpose-built Due Diligence Intelligence subsystem, integrating 122 OSINT source adapters, deep Czech registry connectivity, graph-based entity relationship analysis, and a rigorous triple-checked cross-validation methodology. This course teaches you to build and operate DD investigation workflows from entity creation through risk assessment to final report delivery.

You will learn:

- The DD domain model: entities, cases, findings, risk dimensions, and compliance mapping
- How to implement entity resolution across multiple OSINT sources
- Graph-based ownership chain traversal and shared director network analysis
- Triple-check cross-validation methodology using NABLA Infinity axioms
- KYC/AML compliance workflows and sanctions screening integration
- Building the DD investigation dashboard and case management system

## Prerequisites

- Completed [Multi-Agent Orchestration Patterns](@/academy/agent-orchestration.md)
- Completed [Storage Architecture & Adapters](@/academy/storage-patterns.md)
- Completed [Building LiveView Dashboards](@/academy/liveview-dashboards.md)
- Familiarity with [Entity Resolution](@/glossary/entity-resolution.md) concepts
- Basic understanding of KYC/AML compliance requirements

## The DD Architecture

The DD subsystem is implemented as a set of OTP applications within the Prismatic umbrella. The core `prismatic_dd` application manages entities, cases, and investigation workflows. It delegates OSINT collection to `prismatic_osint_sources` (122 adapters), graph analysis to `prismatic_storage_kuzudb`, and full-text search to `prismatic_storage_meilisearch`.

```elixir
# Core DD modules
defmodule PrismaticDd do
  @moduledoc "Due Diligence Intelligence - main facade."

  @spec create_case(map()) :: {:ok, Case.t()} | {:error, term()}
  def create_case(attrs), do: CaseManager.create(attrs)

  @spec add_entity(String.t(), map()) :: {:ok, Entity.t()} | {:error, term()}
  def add_entity(case_id, attrs), do: EntityManager.create(case_id, attrs)

  @spec investigate(String.t()) :: {:ok, Investigation.t()} | {:error, term()}
  def investigate(entity_id), do: InvestigationEngine.run(entity_id)
end
```

The architecture separates concerns cleanly: the Entity Management Layer handles typed entity representations (Person, Company, Domain, Email, Phone, IP Address, Cryptocurrency, Document), the OSINT Integration Framework orchestrates parallel collection across relevant sources, and the Triple-Check Engine validates findings through source-level, cross-source, and temporal consistency checks.

## Entity Types and Resolution

The DD platform supports eight primary entity types. Each type carries specific identifiers that drive OSINT source selection and entity resolution strategies.

### Entity Creation

When an entity is created, the platform determines which OSINT sources are relevant and triggers parallel collection:

```elixir
# Creating a company entity triggers ARES, Justice.cz, ISIR, RZP lookups
{:ok, entity} = PrismaticDd.add_entity(case_id, %{
  type: :company,
  name: "Acme Holdings s.r.o.",
  identifiers: %{ico: "12345678", dic: "CZ12345678"},
  jurisdiction: "CZ"
})

# Creating a person entity triggers different source sets
{:ok, person} = PrismaticDd.add_entity(case_id, %{
  type: :person,
  name: "Jan Novak",
  identifiers: %{date_of_birth: ~D[1985-03-15]},
  jurisdiction: "CZ"
})
```

### Resolution Across Sources

Entity resolution is the critical step that links records from different sources to the same real-world entity. The platform uses three complementary strategies:

| Strategy | Mechanism | Confidence Range |
|----------|-----------|-----------------|
| **Deterministic** | Exact match on ICO, email, tax ID | 0.95-0.99 |
| **Probabilistic** | Jaro-Winkler name similarity + attribute overlap | 0.60-0.95 |
| **Graph-Based** | Shared directors, addresses, or associates | 0.70-0.95 |

All resolution confidence scores must comply with [NABLA Infinity](@/glossary/nabla-infinity.md) axioms -- particularly Signal Plurality (minimum 2 independent signals) and Provenance Mandatory (every link traceable to evidence).

## Triple-Check Cross-Validation

The platform's signature methodology requires corroboration from at least three independent sources before marking any claim as verified:

1. **Source-Level Validation**: Each OSINT source returns data with an initial confidence based on historical reliability and data freshness. Government registries receive higher base confidence than aggregator services.

2. **Cross-Source Corroboration**: When multiple independent sources return consistent information, Bayesian confidence updating computes composite scores. Three or more consistent sources significantly elevate confidence.

3. **Temporal Consistency**: The third layer examines consistency across time. A company address stable for five years across multiple registry snapshots receives higher confidence than recent data appearing in some sources but not others.

```elixir
# Triple-check validation pipeline
defmodule PrismaticDd.TripleCheck do
  @spec validate(Finding.t(), [Source.result()]) :: {:ok, ValidatedFinding.t()} | {:error, term()}
  def validate(finding, source_results) do
    with {:ok, source_valid} <- validate_sources(finding, source_results),
         {:ok, cross_valid} <- cross_source_corroborate(source_valid),
         {:ok, temporal_valid} <- temporal_consistency_check(cross_valid) do
      {:ok, %ValidatedFinding{
        finding: finding,
        confidence: temporal_valid.confidence,
        sources: temporal_valid.sources,
        validation_level: :triple_checked
      }}
    end
  end
end
```

## Graph Analysis

Due diligence investigations are fundamentally about relationships. The platform models entity relationships as a property graph in KuzuDB, enabling queries that would be prohibitively complex in relational databases.

### Ownership Chain Traversal

Starting from a target company, traverse upward through holding structures to identify ultimate beneficial owners (UBOs):

```elixir
# Traverse ownership chains to find UBOs
{:ok, chain} = PrismaticDd.ownership_chain(entity_id, max_depth: 10)
# Returns: [target_company -> holding_a -> holding_b -> natural_person_ubo]
```

### Shared Director Networks

Identify all companies sharing common directors with a target entity, revealing conflicts of interest or corporate group structures:

```elixir
# Find shared director network
{:ok, network} = PrismaticDd.shared_directors(entity_id)
# Returns: %{directors: [...], shared_companies: [...], risk_flags: [...]}
```

### Address Clustering

Detect entities registered at the same address, which may indicate shell companies or virtual office usage:

```elixir
# Cluster entities by registered address
{:ok, clusters} = PrismaticDd.address_clusters(entity_id, radius_km: 0.1)
```

## Risk Assessment

The Risk Assessment Framework translates findings into structured evaluations across seven dimensions:

| Dimension | Weight | Assessment Criteria |
|-----------|--------|---------------------|
| Financial | 20% | Insolvency history, unpaid taxes, subsidy dependency |
| Legal | 20% | Court proceedings, regulatory actions, sanctions |
| Ownership | 15% | Beneficial ownership opacity, nominee structures, PEP connections |
| Operational | 15% | Business continuity, key person dependency |
| Compliance | 10% | Regulatory compliance history, licensing status |
| Reputational | 10% | Media sentiment, social signals |
| Cyber | 10% | Digital footprint security, data breach history |

Each dimension produces a normalized score (0-100), combined into an overall rating from A (excellent) through F (critical concern), with a numeric score on the 300-900 scale.

## Compliance Integration

The DD platform maps outputs to NIS2 Directive (EU 2022/2555) and ZKB 264/2025 Sb. (Czech implementation) requirements. Reports include compliance-specific sections that map findings to regulatory requirements, enabling direct use in audit and compliance workflows.

## Building the Dashboard

The DD Platform's LiveView dashboard at `/dd` provides case management, entity browsing, investigation controls, and graph visualization. The [Labs](/labs) page includes a DD Investigation tile that provides quick access to case creation and entity classification tools.

```elixir
# DD routes in the router
scope "/dd", PrismaticWeb.DD do
  live "/", OverviewLive, :index
  live "/investigate", InvestigateLive, :index
  live "/cases", CasesLive, :index
  live "/cases/new", CasesLiveNew, :new
  live "/entities", EntitiesLive, :index
  live "/graph", GraphLive, :index
end
```

## Exercises

1. **Create a DD Case**: Use the DD Platform to create a new investigation case, add a Czech company entity by ICO, and observe which OSINT sources are triggered automatically.

2. **Entity Resolution**: Add the same entity using different identifiers (ICO vs. trade name vs. domain) and observe how the resolution engine links them into a single canonical entity.

3. **Graph Exploration**: After populating a case with multiple entities, use the graph view at `/dd/graph` to explore ownership chains and shared director networks.

4. **Triple-Check Validation**: Examine a finding that has been triple-checked, trace its provenance back to the contributing sources, and verify that NABLA axiom compliance is maintained.

5. **Risk Report**: Generate a risk assessment report for a completed investigation and map the findings to NIS2 compliance requirements.

## Related Resources

- [DD Platform Overview](@/dd/_index.md) -- Full architectural documentation
- [OSINT Intelligence Sources](@/osint/_index.md) -- Available OSINT adapters
- [Entity Resolution](@/glossary/entity-resolution.md) -- Resolution methodology
- [Building EASM Features](@/academy/easm-development.md) -- Related security assessment development
- [NABLA Infinity Guide](@/academy/nabla-infinity-guide.md) -- Epistemic framework underpinning triple-check validation
- [Storage Architecture & Adapters](@/academy/storage-patterns.md) -- KuzuDB graph storage patterns

## Practical Implementation

### In Prismatic Platform

Due diligence is implemented across these OSINT and data applications:

- **prismatic_dd** (`apps/prismatic_dd/`) -- Core DD engine with `PrismaticDd` facade for case management, entity creation, and investigation orchestration. Contains schemas for entities (Person, Company, Domain, Email, Phone, IP, Cryptocurrency, Document), cases, and risk assessments
- **prismatic_osint_core** (`apps/prismatic_osint_core/`) -- OSINT source adapter framework defining the interface all 122 source adapters implement. Contains source reliability scoring and parallel collection orchestration
- **prismatic_osint_czech_legal** (`apps/prismatic_osint_czech_legal/`) -- Czech registry adapters: ARES (business registry), Justice.cz (court registry), ISIR (insolvency registry), RZP (trade licenses)
- **prismatic_osint_business_financial** (`apps/prismatic_osint_business_financial/`) -- Business and financial OSINT adapters for corporate intelligence and financial due diligence
- **prismatic_osint_sources** (`apps/prismatic_osint_sources/`) -- Complete catalog of 122 OSINT source adapters organized by domain
- **prismatic_storage_kuzudb** (`apps/prismatic_storage_kuzudb/`) -- Graph database for ownership chain traversal, shared director network analysis, and address clustering via Cypher queries
- **prismatic_storage_meilisearch** (`apps/prismatic_storage_meilisearch/`) -- Full-text search for entity resolution across multiple OSINT sources
- **prismatic_czech_autocrawler** (`apps/prismatic_czech_autocrawler/`) -- Automated crawler for Czech public registries

### Code Examples from the Codebase

DD investigation routes in `prismatic_web/lib/prismatic_web/router.ex`:

```elixir
scope "/dd", PrismaticWeb.DD do
  live "/", OverviewLive, :index
  live "/investigate", InvestigateLive, :index
  live "/cases", CasesLive, :index
  live "/cases/new", CasesLiveNew, :new
  live "/entities", EntitiesLive, :index
  live "/graph", GraphLive, :index
end
```

Entity data is persisted as JSON in `apps/prismatic_dd/priv/data/entities/`:

```bash
# Entity files organized by type
apps/prismatic_dd/priv/data/entities/company/company-*.json
apps/prismatic_dd/priv/data/entities/person/person-*.json
apps/prismatic_dd/priv/data/entities/asset/asset-*.json
```

## See Also

### Related Applications
- [prismatic_dd](@/apps/prismatic-dd.md) -- Core DD engine and investigation orchestrator
- [prismatic_osint_core](@/apps/prismatic-osint-core.md) -- OSINT source adapter framework
- [prismatic_osint_czech_legal](@/apps/prismatic-osint-czech-legal.md) -- Czech registry adapters (ARES, Justice.cz, ISIR, RZP)
- [prismatic_osint_business_financial](@/apps/prismatic-osint-business-financial.md) -- Business and financial intelligence adapters
- [prismatic_osint_sources](@/apps/prismatic-osint-sources.md) -- Full catalog of 122 OSINT source adapters
- [prismatic_osint_monitoring](@/apps/prismatic-osint-monitoring.md) -- Continuous OSINT monitoring and alerting
- [prismatic_storage_kuzudb](@/apps/prismatic-storage-kuzudb.md) -- Graph database for ownership chains
- [prismatic_storage_meilisearch](@/apps/prismatic-storage-meilisearch.md) -- Full-text search for entity resolution
- [prismatic_czech_autocrawler](@/apps/prismatic-czech-autocrawler.md) -- Czech registry automated crawler

### Glossary
- [Due Diligence](@/glossary/due-diligence.md) -- Investigation methodology
- [KYC](@/glossary/kyc.md) -- Know Your Customer compliance
- [AML](@/glossary/aml.md) -- Anti-Money Laundering compliance
- [Entity Resolution](@/glossary/entity-resolution.md) -- Linking records to real-world entities
- [Beneficial Ownership](@/glossary/beneficial-ownership.md) -- Ultimate beneficial owner identification
- [Sanctions Screening](@/glossary/sanctions-screening.md) -- Checking against sanctions lists
- [Triple-Check](@/glossary/triple-check.md) -- Three-source validation methodology
- [Risk Score](@/glossary/risk-score.md) -- Multi-dimensional risk assessment
- [OSINT](@/glossary/osint.md) -- Open Source Intelligence methodology

### Architecture
- [PostgreSQL & KuzuDB](@/architecture/postgresql-kuzudb.md) -- Relational and graph storage for DD
- [Meilisearch](@/architecture/meilisearch.md) -- Search infrastructure for entity discovery
- [Storage Adapters](@/architecture/storage-adapters.md) -- Multi-backend storage architecture

### Related Academy Topics
- [Storage Architecture](@/academy/storage-patterns.md) -- KuzuDB and Meilisearch adapter patterns
- [Building EASM Features](@/academy/easm-development.md) -- Related security assessment capabilities
- [NABLA Infinity Axioms](@/academy/nabla-infinity-guide.md) -- Epistemic framework for triple-check validation
- [Multi-Agent Orchestration](@/academy/agent-orchestration.md) -- OSINT source coordination patterns

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)