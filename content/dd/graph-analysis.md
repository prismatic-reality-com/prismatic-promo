+++
title = "Graph Analysis and Relationship Traversal"
weight = 40
date = "2026-02-17"

[extra]
tags = ["graph-analysis", "kuzudb", "ownership-chains", "relationship-traversal", "due-diligence", "network-analysis"]
icon = "share"
color = "violet"
description = "Graph-based relationship analysis with KuzuDB for ownership chain traversal, director networks, address clustering, and hidden connection discovery"
category = "analysis"
status = "active"
author = "Tomáš Korcak (korczis)"
reading_time = "13 min"
word_count = 2500
difficulty = "advanced"
image = "/images/dd/graph-analysis.png"
image_alt = "Entity relationship graph traversal for ownership analysis"
og_type = "article"
twitter_card = "summary_large_image"
academic_tier = "whitepaper"
content_version = "1.0.0"
last_enhanced = "2026-02-17"
quality_score = 91
see_also = ["entity-management", "methodology", "risk-assessment"]
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Graph", "Analysis", "Relationship", "Traversal", "Graph-based", "KuzuDB", "Prismatic Platform", "Company", "Person", "Address"]
+++

## Abstract

Due diligence investigations are fundamentally exercises in relationship discovery. The connections between persons, companies, addresses, and assets reveal ownership structures, control patterns, conflicts of interest, and risk indicators that no amount of isolated entity analysis can uncover. The Prismatic Platform models these relationships as a property graph stored in [KuzuDB](@/glossary/kuzudb.md), enabling sophisticated traversal queries -- ownership chain resolution, shared director network analysis, address clustering, temporal relationship evolution, and hidden connection discovery -- that would be prohibitively complex or impossible in relational database systems. This document describes the graph data model, the core traversal algorithms, the analytical patterns available to investigators, and the integration with the platform's [entity management](@/dd/entity-management.md) and [risk assessment](@/dd/risk-assessment.md) systems.

## Introduction

### Why Graphs for Due Diligence

Relational databases excel at structured queries over well-defined tables, but they struggle with the variable-depth, multi-hop traversals that characterize due diligence investigations. Consider a fundamental due diligence question: "Who is the ultimate beneficial owner of Company X?" Answering this requires traversing an ownership chain of unknown depth through multiple intermediate holding companies, potentially crossing jurisdictional boundaries and encountering circular ownership structures, nominee arrangements, and trust vehicles.

In SQL, this query requires recursive common table expressions with depth limits, performance degradation at each additional hop, and awkward handling of cycles. In a graph database, the same query is a natural multi-hop traversal that follows ownership edges from the target node upward until reaching natural person endpoints or the configured depth limit.

The Prismatic Platform uses [KuzuDB](@/glossary/kuzudb.md) -- an embedded graph database engine optimized for analytical workloads -- as its relationship storage and traversal engine. KuzuDB's columnar storage format and vectorized query execution provide the performance characteristics needed for interactive investigation workflows where analysts expect sub-second responses to complex traversal queries.

### Graph Data Model

The platform's graph model consists of entity nodes and relationship edges, both carrying typed properties:

**Node Types** (corresponding to [entity types](@/dd/entity-management.md)):

| Node Type | Key Properties | Source |
|-----------|---------------|--------|
| **Person** | name, date_of_birth, nationality, pep_status | Registry data, OSINT |
| **Company** | ico, legal_name, legal_form, status, formation_date | [ARES](@/osint/ares.md), [Justice.cz](@/osint/justice-cz.md) |
| **Address** | street, city, postal_code, country, geocoordinates | Normalized from registries |
| **Domain** | domain_name, registrar, registration_date | WHOIS, DNS |
| **BankAccount** | iban, bank_code, currency | Financial sources |
| **Document** | reference, type, court, filing_date | Court records |

**Edge Types**:

| Edge Type | From | To | Properties |
|-----------|------|-----|------------|
| **OWNS** | Person/Company | Company | share_percentage, since, until, source |
| **DIRECTS** | Person | Company | role, since, until, source |
| **REGISTERED_AT** | Company | Address | type (seat/branch/mailing), since, until |
| **RESIDES_AT** | Person | Address | since, until, source |
| **CONTROLS** | Person/Company | Domain | since, until |
| **CONTRACTS_WITH** | Company | Company | contract_id, value, date |
| **RELATED_TO** | Any | Any | relationship_type, confidence |

All edges carry temporal properties (`since`, `until`) that enable point-in-time graph queries and temporal evolution analysis.

## Core Traversal Algorithms

### Ownership Chain Traversal

The most critical traversal pattern for due diligence is ownership chain resolution -- determining the ultimate beneficial owners (UBOs) of a target entity by following OWNS edges upward through the ownership hierarchy.

```
Target Company
    |
    OWNS (60%) --> Holding Company A (Czech s.r.o.)
    |                   |
    |                   OWNS (100%) --> Person X (Czech national)
    |
    OWNS (40%) --> Holding Company B (Cypriot Ltd)
                        |
                        OWNS (75%) --> Trust Vehicle C (Jersey)
                        |                   |
                        |                   BENEFICIARY --> Person Y (Russian national)
                        |
                        OWNS (25%) --> Foundation D (Liechtenstein)
                                            |
                                            CONTROLLER --> Person Z (Unknown)
```

The traversal algorithm:

1. **Start** at the target company node
2. **Follow** all incoming OWNS edges, recording share percentages
3. **At each intermediate node**, multiply the accumulated ownership percentage by the edge's share percentage to compute effective ownership
4. **Terminate** when reaching natural person nodes, depth limit, or nodes with no further ownership edges
5. **Flag** circular ownership (A owns B owns A) and nominee patterns (single person directing 10+ companies)
6. **Report** all paths from target to natural persons, with effective ownership percentages

The platform applies the EU's Fourth Anti-Money Laundering Directive threshold of 25% for beneficial ownership determination. Any natural person with 25% or more effective ownership is flagged as a UBO. Persons with significant control through other means (director positions, shareholder agreements) are flagged as potential controllers even below the 25% threshold.

### Director Network Analysis

Director network analysis identifies all companies sharing common directors or statutory body members with a target entity, revealing potential conflicts of interest, corporate group structures, and nominee director patterns.

```
Person A (Director)
    |
    DIRECTS --> Company 1 (Target)
    DIRECTS --> Company 2 (Supplier to Company 1)
    DIRECTS --> Company 3 (Competitor to Company 1)
    DIRECTS --> Company 4 (Recently dissolved)
```

The analysis proceeds in two stages:

**Stage 1: Network Discovery**
Starting from the target company, the platform identifies all directors, then for each director identifies all other companies they direct. This produces a bipartite graph of persons and companies connected by DIRECTS edges.

**Stage 2: Analytical Assessment**
The platform computes several analytical metrics on the director network:

| Metric | Description | Risk Implication |
|--------|-------------|-----------------|
| **Director degree** | Number of companies a person directs | High degree suggests nominee or professional director |
| **Cross-directorships** | Directors shared between target and its counterparties | Potential conflicts of interest |
| **Temporal overlap** | Companies directed simultaneously vs sequentially | Simultaneous suggests ongoing relationships |
| **Dissolution rate** | Fraction of directed companies that are dissolved | High rate may indicate serial company formation/dissolution |
| **Sector concentration** | NACE code overlap between directed companies | Indicates industry focus or potential cartel structures |

### Address Clustering

Address clustering detects entities registered at the same physical location, which may indicate shell companies, virtual office usage, mass registration addresses, or legitimate shared service arrangements.

The platform maintains an address normalization layer that resolves Czech addresses into canonical forms, handling common variations in street naming, house numbering, and postal code formatting. Normalized addresses are geocoded, and entities within a configurable proximity threshold (default 50 meters) are clustered together.

**Cluster Classification**:

| Cluster Size | Classification | Investigation Action |
|--------------|---------------|---------------------|
| 1-3 entities | Normal | No action required |
| 4-10 entities | Elevated | Review for shared services or virtual office |
| 11-50 entities | High | Investigate for mass registration address |
| 50+ entities | Critical | Flag as potential shell company factory |

The platform cross-references address clusters with [CUZK](@/osint/cuzk.md) property records to determine whether the address is a residential property, commercial office, registered agent's premises, or virtual office provider.

### Hidden Connection Discovery

Beyond explicit relationship edges, the platform applies graph algorithms to discover implicit connections that may not be apparent from direct entity examination:

**Shortest Path Analysis**: Given two entities that appear unrelated, the platform computes the shortest path between them through the relationship graph. A due diligence target with a shortest-path connection of length 2 to a sanctioned entity (e.g., Target --> Holding Company --> Sanctioned Person) warrants investigation even if the direct relationship is not obvious.

**Community Detection**: The platform applies the Louvain community detection algorithm to identify clusters of densely interconnected entities within the broader investigation graph. These communities often correspond to corporate groups, family business networks, or coordinated entity structures.

**Centrality Analysis**: Betweenness centrality computation identifies entities that serve as critical intermediaries in the relationship network. High-centrality persons or companies may represent key control points in complex corporate structures.

**Anomaly Detection**: Graph-level anomalies such as isolated clusters (entities with no connections to the broader investigation graph), star patterns (single entity connected to many others with no inter-connections), and bridge nodes (entities whose removal would disconnect graph components) are flagged for analyst review.

## Temporal Graph Analysis

### Point-in-Time Queries

The temporal properties on edges enable point-in-time graph queries that reconstruct the relationship network as it existed at any historical date. This capability is essential for:

- **Pre-transaction analysis**: Examining the ownership structure of an M&A target as it existed before a transaction was announced (when restructuring may have occurred)
- **Sanctions screening**: Determining whether a sanctioned person was a beneficial owner at the time of a specific transaction
- **Regulatory compliance**: Verifying that the entity structure complied with regulations at the time of a specific event

### Relationship Evolution Visualization

The platform generates temporal evolution visualizations that show how an entity's relationship network has changed over time. These visualizations highlight:

- **Ownership changes**: Share transfers, new investors, departing shareholders
- **Director turnover**: Changes in statutory body composition and timing
- **Structural changes**: New subsidiaries, mergers, demergers, dissolutions
- **Address changes**: Registered seat relocations, especially across jurisdictions

Rapid structural changes in the months preceding an M&A transaction or regulatory event are flagged as potential indicators of preparatory restructuring.

### Change Velocity Scoring

The platform computes a normalized change velocity score for each entity, measuring the rate of structural change relative to industry norms. This score feeds directly into the [risk assessment](@/dd/risk-assessment.md) framework as part of the Ownership risk dimension.

## Integration with Investigation Workflow

### Graph Expansion in Case Management

Within the [case management system](@/dd/case-management.md), graph analysis drives the investigation expansion process:

1. Analyst creates a case with seed entities
2. Platform performs initial enrichment from [OSINT sources](@/dd/osint-integration.md)
3. Graph expansion discovers related entities through relationship edges
4. Newly discovered entities are added to the case for enrichment
5. The expansion process repeats until reaching the configured depth limit or analyst-defined scope boundary
6. The resulting investigation graph is available for all traversal and analytical queries

### Risk Score Contribution

Graph analysis contributes to multiple dimensions of the [risk assessment framework](@/dd/risk-assessment.md):

| Risk Dimension | Graph Contribution |
|---------------|-------------------|
| **Ownership** | Beneficial ownership opacity, nominee patterns, circular ownership |
| **Legal** | Director network connections to litigation or insolvency |
| **Compliance** | Connections to sanctioned entities, PEP proximity |
| **Operational** | Key person dependency (single director controlling many entities) |
| **Reputational** | Association with controversial entities through network connections |

### Visualization and Reporting

The platform provides interactive graph visualizations through [Phoenix LiveView](@/glossary/liveview.md), allowing analysts to:

- Explore entity relationships interactively
- Filter by relationship type, time period, or confidence level
- Highlight paths between specific entities
- Collapse or expand corporate group clusters
- Export graph visualizations for inclusion in due diligence reports

## Performance and Scalability

KuzuDB's embedded architecture and columnar storage format provide the performance characteristics required for interactive investigation workflows:

| Operation | Typical Performance |
|-----------|-------------------|
| Single-hop traversal | <10ms |
| Ownership chain (5 hops) | <50ms |
| Director network (2 hops) | <100ms |
| Shortest path (up to 10 hops) | <200ms |
| Community detection (1000 nodes) | <500ms |
| Full graph export | <2s for 10,000 nodes |

The platform's graph store scales linearly with entity count, supporting investigation graphs with tens of thousands of entities and hundreds of thousands of relationships without performance degradation.

## Conclusion

Graph-based relationship analysis is the analytical engine that transforms individual entity data points into investigative intelligence. By modeling the complex web of ownership, directorship, address, and contractual relationships as a traversable property graph, the Prismatic Platform enables investigators to answer the questions that matter most in due diligence: Who really owns this company? Who controls it? What are the hidden connections? And how has this structure changed over time?

## References

- [Entity Management System](@/dd/entity-management.md)
- [Risk Assessment Framework](@/dd/risk-assessment.md)
- [Case Management System](@/dd/case-management.md)
- [KuzuDB Graph Engine](@/glossary/kuzudb.md)
- [Czech Registry Integration](@/dd/czech-registries.md)
- [OSINT Integration Framework](@/dd/osint-integration.md)
- [Phoenix LiveView](@/glossary/liveview.md)
- [M&A Due Diligence](@/dd/ma-due-diligence.md)

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
