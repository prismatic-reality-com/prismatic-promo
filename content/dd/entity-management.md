+++
title = "Entity Management System"
weight = 20
date = "2026-02-17"

[extra]
tags = ["entity-management", "entity-resolution", "person", "company", "domain", "email", "due-diligence"]
icon = "users"
color = "blue"
description = "Comprehensive entity management for persons, companies, domains, emails, and more with typed versioned representations and complete audit trails"
category = "core"
status = "active"
author = "Tomáš Korcak (korczis)"
reading_time = "14 min"
word_count = 2600
difficulty = "intermediate"
image = "/images/dd/entity-management.png"
image_alt = "Entity management architecture with typed entity representations"
og_type = "article"
twitter_card = "summary_large_image"
academic_tier = "whitepaper"
content_version = "1.0.0"
last_enhanced = "2026-02-17"
quality_score = 90
see_also = ["methodology", "graph-analysis", "czech-registries"]
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Entity", "Management", "System", "Comprehensive", "core", "Prismatic Platform", "Czech", "Full"]
+++

## Abstract

The Entity Management System is the central data model of the Prismatic Platform's due diligence capability. It provides typed, versioned, auditable representations of all subjects under investigation -- persons, companies, domains, email addresses, phone numbers, IP addresses, cryptocurrency wallets, and documents. Every entity instance maintains a complete provenance trail recording how it was discovered, which [OSINT](@/glossary/osint.md) sources contributed data, the confidence level of each data point, and the temporal history of changes. This document describes the entity type system, the resolution algorithms that merge records across disparate sources into unified entity profiles, and the storage architecture that supports both full-text search and graph traversal across entity relationships.

## Introduction

### The Entity as Investigative Primitive

Due diligence investigations are fundamentally about entities and their relationships. An M&A analyst investigating a target company needs to understand not just the company itself, but its directors, shareholders, subsidiaries, contractors, domain registrations, email footprints, and financial connections. Each of these constitutes an entity that must be individually tracked, verified, and connected into the investigation's relationship graph.

The Prismatic Platform treats entities as first-class objects with defined types, schemas, and lifecycle management. Unlike generic document-oriented approaches where entity data is scattered across unstructured notes and reports, the platform's Entity Management System enforces structured representations that enable programmatic analysis, cross-source validation through the [triple-check methodology](@/dd/methodology.md), and graph traversal through the [graph analysis engine](@/dd/graph-analysis.md).

### Design Principles

The Entity Management System follows four design principles derived from the platform's [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine:

1. **Type Safety**: Every entity has a defined type with a specific schema. There are no generic "entity" objects that could contain arbitrary unstructured data.
2. **Immutable History**: Entity attributes are versioned, not overwritten. When a company's registered address changes, the previous address is preserved with full temporal metadata.
3. **Source Attribution**: Every attribute value carries provenance metadata identifying which source provided it, when it was collected, and what confidence level was assigned.
4. **Resolution Transparency**: When multiple source records are merged into a single entity, the resolution logic and merge decisions are recorded and auditable.

## Entity Type System

### Primary Entity Types

The platform supports eight primary entity types, each with a defined schema and specific identifier semantics:

| Entity Type | Primary Identifiers | Secondary Identifiers | Key Attributes |
|-------------|--------------------|-----------------------|----------------|
| **Person** | Full name + date of birth | National ID, passport number | Roles, addresses, PEP status, sanctions matches |
| **Company** | ICO (Czech), DUNS, LEI | Trade name, DIC, registration number | Legal form, statutory bodies, registered capital, NACE codes |
| **Domain** | Domain name | Registrar, registrant ID | WHOIS data, DNS records, SSL certificates, hosting |
| **Email** | Email address | Associated domain, mailserver | Breach status, reputation score, deliverability |
| **Phone** | Phone number + country code | Carrier, line type | Carrier lookup, location, VoIP status |
| **IP Address** | IPv4 or IPv6 address | ASN, CIDR block | Geolocation, reputation, open ports, abuse reports |
| **Cryptocurrency** | Wallet address + chain | Exchange association | Transaction volume, risk score, cluster analysis |
| **Document** | Reference number + registry | Court case ID, filing number | Document type, parties, dates, status |

### Entity Schema Definition

Each entity type is defined through an [Elixir](@/glossary/elixir.md) schema module that specifies required fields, optional fields, validation rules, and serialization formats. The schema system leverages [Ecto](@/glossary/ecto.md) changesets for validation and [typespecs](@/glossary/typespec.md) for compile-time type safety.

```elixir
defmodule PrismaticDD.Entity.Company do
  @type t :: %__MODULE__{
    id: Ecto.UUID.t(),
    ico: String.t(),
    dic: String.t() | nil,
    legal_name: String.t(),
    trade_names: [String.t()],
    legal_form: atom(),
    registered_capital: Money.t() | nil,
    statutory_bodies: [StatutoryBody.t()],
    shareholders: [Shareholder.t()],
    addresses: [Address.t()],
    nace_codes: [String.t()],
    formation_date: Date.t(),
    dissolution_date: Date.t() | nil,
    status: :active | :dissolved | :in_liquidation | :insolvent,
    source_records: [SourceRecord.t()],
    confidence: ConfidenceScore.t(),
    metadata: map()
  }
end
```

### Entity Lifecycle

Entities progress through a defined lifecycle within the investigation:

```
Discovery --> Enrichment --> Validation --> Verified --> Monitoring
    |              |              |             |            |
  Created     Sources queried  Triple-check   Accepted   Continuous
  from seed   data merged      applied        for report  watch
```

1. **Discovery**: An entity is created either manually by an analyst or automatically through graph expansion from a related entity. At this stage, the entity may have minimal attributes (e.g., just a company name or ICO number).

2. **Enrichment**: The platform's orchestration engine triggers parallel queries across all relevant [OSINT sources](@/dd/osint-integration.md), collecting data from registries, databases, and intelligence feeds. Source records are normalized and attached to the entity.

3. **Validation**: The [triple-check cross-validation methodology](@/dd/methodology.md) is applied to each attribute, computing confidence scores based on multi-source corroboration and temporal consistency.

4. **Verified**: Attributes that pass validation are marked as verified with their confidence scores. The entity is now eligible for inclusion in due diligence reports and [risk assessments](@/dd/risk-assessment.md).

5. **Monitoring**: For ongoing investigations or post-deal monitoring, verified entities enter a monitoring state where the platform periodically re-queries sources and alerts analysts to material changes.

## Entity Resolution

### The Resolution Challenge

Entity resolution -- the process of determining whether two records from different sources refer to the same real-world entity -- is one of the most technically challenging aspects of due diligence automation. A Czech company might appear as:

- "Prismatic s.r.o." in ARES
- "PRISMATIC, spolecnost s rucenim omezenym" in Justice.cz
- "Prismatic SRO" in an international credit database
- "Prismatic Ltd" in English-language business directories

All four records refer to the same entity, but establishing this programmatically requires understanding Czech legal form abbreviations, case normalization, diacritical mark handling, and the relationship between Czech and international company naming conventions.

### Resolution Algorithm

The platform's entity resolution engine uses a multi-stage approach:

**Stage 1: Deterministic Matching**: If two records share a strong identifier (ICO, DIC, LEI, DUNS), they are immediately linked. Strong identifiers are unique by design and provide certain matches.

**Stage 2: Probabilistic Matching**: For records without shared strong identifiers, the engine applies probabilistic matching across multiple attribute comparisons:

| Attribute | Matching Method | Weight |
|-----------|----------------|--------|
| Legal name | Levenshtein distance + Czech normalization | 0.30 |
| Address | Address component parsing + geocode proximity | 0.20 |
| Formation date | Exact match + tolerance window | 0.15 |
| Legal form | Legal form equivalence mapping | 0.10 |
| Director names | Name matching with diacritical normalization | 0.15 |
| NACE codes | Set intersection similarity | 0.10 |

Records with a composite match score above 0.85 are automatically merged. Records scoring between 0.65 and 0.85 are flagged for analyst review. Records below 0.65 are treated as distinct entities.

**Stage 3: Graph-Based Resolution**: After initial matching, the [graph analysis engine](@/dd/graph-analysis.md) examines relationship patterns to identify potential matches that attribute-level comparison missed. If two company records share three or more directors, the same registered address, and similar NACE codes, the graph engine flags them as probable matches even if their names differ significantly (e.g., after a corporate renaming event).

### Czech-Specific Normalization

Entity resolution in the Czech context requires specialized normalization rules:

- **Legal form mapping**: "s.r.o." = "spolecnost s rucenim omezenym" = "spol. s r.o." = "SRO"
- **Diacritical handling**: "Ceska" = "Ceska" for matching purposes, with the canonical form preserving diacritics
- **Address normalization**: Czech address formats vary significantly across registries; the platform parses addresses into structured components (street, house number, municipality, postal code, district) before comparison
- **ICO validation**: The platform validates ICO check digits to reject malformed identifiers before they enter the resolution pipeline
- **Name prefixes/suffixes**: Common prefixes ("Ing.", "Mgr.", "JUDr.") and suffixes ("CSc.", "PhD.") are stripped during person name matching

## Storage Architecture

The Entity Management System uses a polyglot persistence architecture that leverages the strengths of multiple storage engines:

### PostgreSQL: Primary Entity Store

[PostgreSQL](@/glossary/postgresql.md) serves as the system of record for all entity data. Each entity type maps to a dedicated table with appropriate indexing, constraints, and audit triggers. The platform uses [Ecto](@/glossary/ecto.md) for schema management and query construction, with migrations tracking every schema evolution.

Key PostgreSQL features leveraged:
- **JSONB columns**: For flexible metadata and source-specific attributes that vary between records
- **Temporal tables**: For maintaining entity attribute history without overwriting previous values
- **Full-text search**: For basic entity search queries using PostgreSQL's built-in tsvector indexing
- **Row-level security**: For enforcing case-level access control on entity data

### Meilisearch: Full-Text Search

[Meilisearch](@/glossary/meilisearch.md) provides the primary search interface for entity discovery, supporting typo-tolerant, real-time search across entity names, addresses, and descriptions. The search index is updated asynchronously from PostgreSQL change events, ensuring near-real-time search availability without impacting write performance.

### KuzuDB: Graph Relationships

[KuzuDB](@/glossary/kuzudb.md) stores and traverses entity relationships -- ownership chains, director networks, address clusters, and inter-entity connections. The graph representation enables the relationship queries described in the [graph analysis](@/dd/graph-analysis.md) documentation, including multi-hop traversals that would be prohibitively expensive in relational SQL.

### ETS: Real-Time Cache

[ETS](@/glossary/ets.md) (Erlang Term Storage) provides in-memory caching for frequently accessed entity data, reducing database load during active investigation sessions where analysts repeatedly access the same entity profiles.

## Audit Trail and Provenance

Every modification to an entity record generates an immutable [audit trail](@/glossary/audit-trail.md) entry recording:

| Field | Description |
|-------|-------------|
| **Entity ID** | UUID of the affected entity |
| **Attribute** | Which attribute was modified |
| **Previous value** | The value before modification (nil for creation) |
| **New value** | The value after modification |
| **Source** | Which OSINT source or analyst provided the new value |
| **Confidence** | The confidence score assigned to the new value |
| **Timestamp** | UTC timestamp of the modification |
| **Actor** | The system process or user who triggered the change |
| **Investigation ID** | The case/investigation context |

The audit trail satisfies the [Provenance Mandatory](@/glossary/provenance-mandatory.md) axiom from the NABLA framework, ensuring that every data point in the system can be traced to its origin. This is essential for regulatory compliance, where auditors may require evidence of how specific findings were derived.

## Entity Discovery Patterns

### Seed Expansion

Most investigations begin with a small set of seed entities -- typically the target company and its known principals. The platform's discovery engine expands from these seeds through systematic source querying:

1. **Direct enrichment**: Query all relevant sources for the seed entity's identifiers
2. **Relational discovery**: Extract related entities from source responses (e.g., directors, shareholders, subsidiaries from registry data)
3. **Graph expansion**: For each newly discovered entity, repeat the enrichment process up to a configurable depth limit
4. **Deduplication**: Apply entity resolution to merge records that refer to the same real-world entity

This expansion process typically discovers 10-50x more entities than the initial seed set, revealing the full network of relationships surrounding the investigation target.

### Analyst-Directed Discovery

Beyond automated expansion, analysts can manually create entities and trigger targeted enrichment for specific investigation leads. The platform provides a LiveView interface for entity creation, with real-time feedback as OSINT sources return results and the validation pipeline processes new data.

## Performance Characteristics

The Entity Management System is designed for the scale requirements of enterprise due diligence:

| Operation | Typical Latency | Throughput |
|-----------|----------------|------------|
| Entity creation | <50ms | 100+ per second |
| Single-source enrichment | 200ms - 2s | Depends on source API |
| Full entity enrichment (all sources) | 5-30s | Parallel across sources |
| Entity resolution (pair) | <10ms | 10,000+ pairs per second |
| Graph expansion (1 hop) | <100ms | Depends on relationship density |
| Full-text search | <50ms | Supports 1,000+ concurrent queries |

## Conclusion

The Entity Management System provides the structured, auditable, and type-safe data foundation that enables every other component of the Prismatic DD Intelligence platform -- from [cross-validation](@/dd/methodology.md) through [graph analysis](@/dd/graph-analysis.md) to [risk assessment](@/dd/risk-assessment.md). By treating entities as first-class objects with defined schemas, immutable history, and source attribution, the platform ensures that due diligence findings rest on a solid evidentiary base that satisfies both analytical and regulatory requirements.

## References

- [Triple-Check Methodology](@/dd/methodology.md)
- [Graph Analysis Engine](@/dd/graph-analysis.md)
- [Czech Registry Integration](@/dd/czech-registries.md)
- [OSINT Integration Framework](@/dd/osint-integration.md)
- [Entity Resolution](@/glossary/entity-resolution.md)
- [PostgreSQL Storage](@/glossary/postgresql.md)
- [KuzuDB Graph Engine](@/glossary/kuzudb.md)
- [Meilisearch Search Engine](@/glossary/meilisearch.md)
- [Audit Trail](@/glossary/audit-trail.md)

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
