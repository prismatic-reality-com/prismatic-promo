+++
title = "l2-entity-resolver"
weight = 213
[extra]
domain = "entity-resolution-synthesis"
level = "L3"
description = "Second-level entity resolution and cross-reference synthesis engine for multi-source identity matching and relationship mapping"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["osint", "entity-resolution", "nabla-infinity", "trinity-gate", "aiad", "kuzudb", "postgresql", "no-doubts", "seadf", "telemetry"]
domain_normalized = "intelligence"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2150
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["l2-entity-resolver", "Second-level", "agents", "agent", "Prismatic Platform", "Relationship", "KuzuDB", "Strategic Command"]
tags = ["agents", "agent", "l2-entity-resolver", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "l2-entity-resolver - Prismatic Platform"
+++

## Overview

The l2-entity-resolver is an L3 [Strategic Command](@/glossary/strategic-command.md) agent operating within the entity resolution synthesis domain of the Prismatic Platform. It serves as the second processing level in the platform's three-tier intelligence pipeline (L1 pattern recognition, L2 entity resolution, L3 strategy optimization), responsible for resolving pattern observations from the [l1-pattern-engine](@/agents/l1-pattern-engine.md) into disambiguated entity identities and mapping relationships between resolved entities. Where L1 operates on data patterns, L2 operates on entities -- the real-world persons, organizations, addresses, and assets that data patterns represent.

Built on the [AIAD](@/glossary/aiad.md) standard with deep integration into the platform's [entity resolution](@/glossary/entity-resolution.md) infrastructure, the l2-entity-resolver applies sophisticated matching algorithms to determine whether data records from different sources refer to the same real-world entity. This is a fundamentally challenging problem because entities appear differently across data sources: names may be transliterated, abbreviated, or misspelled; addresses may use different formatting conventions; and temporal changes (name changes, address changes, role changes) create legitimate variation that must be distinguished from genuine entity distinction.

## Entity Resolution Architecture

The entity resolution architecture implements a pipelined approach with three core phases: blocking, matching, and clustering. This architecture is designed to balance resolution accuracy against computational cost, since naive all-pairs comparison of entity records is quadratically expensive and infeasible at platform scale.

The blocking phase partitions the record space into blocks of potentially matching records using lightweight similarity criteria. Common blocking keys include normalized name prefixes, address postal codes, date-of-birth year ranges, and shared corporate registry identifiers. Blocking dramatically reduces the number of record pairs that require detailed comparison by eliminating obviously non-matching pairs. The blocking strategy is configurable per entity type and data source, with block key selection guided by historical matching statistics.

The matching phase compares records within each block using a weighted combination of field-level similarity scores. Name similarity uses phonetic algorithms (adapted for Czech phonetics including characters with hacky and carky), edit distance calculations, and token-based comparison for multi-word names. Address similarity uses structured address parsing with component-level comparison (street, number, city, postal code). Date similarity uses fuzzy date matching that handles partial dates and transposed date components. Each field similarity score is weighted according to its discriminative power for the entity type being resolved.

The clustering phase groups records with high pairwise similarity into entity clusters, each representing a single real-world entity. Clustering applies transitive closure with configurable thresholds: if record A matches record B and record B matches record C, all three are clustered together even if A and C have lower direct similarity. The clustering algorithm includes conflict detection that flags clusters containing contradictory information (such as two different dates of birth) for human review rather than silently merging inconsistent records.

## Key Capabilities

- **Multi-source identity matching** -- Resolves entity identities across heterogeneous data sources including corporate registries, beneficial ownership databases, professional networks, litigation records, and OSINT collection outputs
- **Phonetic-aware name matching** -- Applies phonetic algorithms calibrated for Czech, Slovak, and other Central European languages, handling diacritical marks, transliteration variations, and common name abbreviation patterns
- **Address normalization and matching** -- Parses and normalizes addresses across formatting conventions, comparing at the component level (street, building number, municipality, postal code, country) for accurate address-based entity linking
- **Temporal entity tracking** -- Maintains entity identity continuity across temporal changes (name changes, address changes, role changes) by tracking the evolution of entity attributes over time
- **Relationship mapping** -- Discovers and maps relationships between resolved entities including corporate ownership chains, director networks, shared address connections, and family/professional associations
- **Confidence-scored results** -- Every entity resolution decision carries an explicit confidence score reflecting match quality, source reliability, and information completeness
- **[KuzuDB](@/glossary/kuzudb.md) graph persistence** -- Stores resolved entities and relationships in the platform's graph database for relationship-aware querying
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with continuous resolution of incoming pattern observations

## Relationship Mapping

Beyond resolving individual entity identities, the l2-entity-resolver maps relationships between resolved entities, constructing knowledge graphs that reveal hidden connections. Relationship types include corporate relationships (ownership, directorship, beneficial ownership), professional relationships (employment, co-directorship, business partnership), spatial relationships (co-location, proximity), and temporal relationships (sequential ownership, role succession).

Relationship mapping leverages the resolved entity clusters to identify cross-entity patterns that are invisible when analyzing individual records. For example, a pattern of shared directors between companies becomes visible only after the director records are resolved into unique identities and the directorship relationships are mapped. Similarly, beneficial ownership chains become traceable only when intermediate holding companies are resolved and linked through their ownership relationships.

The relationship graph is stored in [KuzuDB](@/glossary/kuzudb.md), the platform's graph database, enabling efficient traversal queries such as "find all companies within two ownership hops of entity X" or "identify all persons who have served as directors of companies registered at address Y." These graph queries power downstream strategic analysis in the [l3-strategy-optimizer](@/agents/l3-strategy-optimizer.md).

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination authority enabling the entity resolver to access data from multiple source domains, publish resolved entity records to the platform's knowledge graph, and coordinate with upstream pattern recognition and downstream strategy optimization agents.

## Integration Architecture

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Runtime execution and lifecycle management |
| [KuzuDB](@/glossary/kuzudb.md) | Graph database for entity and relationship storage |
| [PostgreSQL](@/glossary/postgresql.md) | Relational storage for entity resolution metadata and matching statistics |
| Prismatic OSINT | Source data from OSINT collection pipelines |
| Prismatic Telemetry | Resolution accuracy [metrics](@/glossary/metrics.md) and throughput monitoring |
| [SEADF](@/glossary/seadf.md) | Autonomous evolution of matching algorithms and threshold calibration |
| [Trinity Gate](@/glossary/trinity-gate.md) | Epistemic validation of entity resolution claims |

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/l2 resolve <records>` | Resolve entity identities from provided data records | L3+ |
| `/l2 match <entity_a> <entity_b>` | Compute pairwise similarity between two entity records | L2+ |
| `/l2 cluster <entity_id>` | Display the entity cluster for a resolved entity | L2+ |
| `/l2 relationships <entity_id>` | Map relationships for a resolved entity | L3+ |
| `/l2 conflicts` | Report entity clusters with internal contradictions | L3+ |

## Coordination with Pipeline Agents

| Agent | Relationship |
|-------|-------------|
| [**l1-pattern-engine**](@/agents/l1-pattern-engine.md) (L3) | Provides enriched pattern observations as input for entity resolution |
| [**l3-strategy-optimizer**](@/agents/l3-strategy-optimizer.md) (L3) | Consumes resolved entities and relationships for strategic analysis |
| [**investigate-coordinator**](@/agents/investigate-coordinator.md) (L3) | Routes entity-focused investigations through the resolution pipeline |
| [**primary-identity-verification-commander**](@/agents/primary-identity-verification-commander.md) (L3) | Uses resolved entities for identity verification workflows |

## Epistemic Framework

Entity resolution decisions are governed by the [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework. The signal plurality axiom requires that entity merges be supported by evidence from at least two independent data fields (a name match alone is insufficient; it must be corroborated by an address match, date match, or identifier match). The contradiction preservation axiom ensures that conflicting information within an entity cluster is preserved and flagged rather than silently resolved. The [Trinity Gate](@/glossary/trinity-gate.md) validates that the resulting entity graph maintains structural consistency (no impossible relationship patterns), logical consistency (no contradictory identity claims), and temporal consistency (entity attribute changes follow plausible timelines).

## Enforcement

The [NO MERCY](@/glossary/no-mercy.md) doctrine prohibits incomplete entity resolution. Every entity record processed by the resolver receives a resolution decision (match, non-match, or uncertain) with an explicit confidence score. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires that uncertain cases are explicitly flagged for human review rather than resolved through arbitrary threshold application. Entity merge decisions above 0.95 confidence proceed automatically; decisions between 0.70 and 0.95 are flagged as probable matches requiring confirmation; decisions below 0.70 are recorded as non-matches unless contradicted by subsequent evidence.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)