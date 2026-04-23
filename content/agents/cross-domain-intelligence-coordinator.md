+++
title = "cross-domain-intelligence-coordinator"
weight = 105
[extra]
domain = "advanced-intelligence-coordination"
level = "L3"
description = "Autonomous AIAD agent for advanced intelligence coordination synthesizing signals from OSINT, compliance, financial, legal, and technical domains into unified intelligence products."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["osint", "entity-resolution", "nabla-infinity", "trinity-gate", "aiad", "kuzudb", "postgresql", "no-doubts", "telemetry", "ecto"]
domain_normalized = "intelligence"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1950
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["cross-domain-intelligence-coordinator", "Autonomous", "AIAD", "OSINT", "agents", "agent", "Prismatic Platform", "Intelligence", "KuzuDB"]
tags = ["agents", "agent", "cross-domain-intelligence-coordinator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "cross-domain-intelligence-coordinator - Prismatic Platform"
+++

## Overview

The Cross-Domain Intelligence Coordinator operates as an L3 [strategic command](/glossary/strategic-command/) agent within the Advanced Intelligence Coordination domain of the Prismatic Platform. This agent synthesizes intelligence signals from multiple operational domains -- [OSINT](/glossary/osint/), compliance, financial, legal, and technical -- into unified intelligence products that provide decision-makers with cross-correlated, evidence-grade assessments.

Intelligence gathered in isolation often misses critical connections. A financial anomaly might correlate with a legal filing, which in turn connects to an OSINT signal from public records. The Cross-Domain Intelligence Coordinator specializes in discovering these cross-domain correlations by maintaining a unified entity graph backed by [KuzuDB](/glossary/kuzudb/) and [PostgreSQL](/glossary/postgresql/). By applying the NABLA [Signal Plurality](/glossary/signal-plurality/) axiom, the coordinator ensures that intelligence assessments draw from multiple independent sources before reaching [confidence threshold](/glossary/confidence-threshold/)s.

The coordinator serves as the intelligence layer that sits above individual domain specialists, providing the synthesis capability that transforms domain-specific signals into actionable multi-dimensional intelligence. Without this synthesis layer, intelligence consumers would receive fragmented assessments from individual domains without the cross-domain correlation that often reveals the most significant insights.

## Operational Domain

The Advanced Intelligence Coordination domain sits above individual intelligence specializations, providing the synthesis layer that transforms domain-specific signals into actionable multi-dimensional intelligence. The coordinator manages [intelligence fusion](/glossary/intelligence-fusion/) pipelines, [entity resolution](/glossary/entity-resolution/) across data sources, and [confidence scoring](/glossary/confidence-scoring/) models that weight evidence by source independence and temporal freshness.

Intelligence coordination requires understanding not just the data from each domain but also the limitations, biases, and coverage gaps inherent in each domain's collection methods. OSINT data has broad coverage but variable quality. Financial records are highly structured but narrow in scope. Legal filings provide authoritative information but with significant time delays. The coordinator models these characteristics explicitly, adjusting the weight given to each domain's contributions based on the specific question being addressed.

The domain also encompasses intelligence gap analysis, identifying questions that cannot be answered with current data and recommending targeted collection activities to fill critical gaps. This proactive intelligence management ensures that the platform's collection resources are directed toward the highest-value targets rather than operating on fixed schedules regardless of intelligence needs.

## Intelligence Fusion Pipeline

The intelligence fusion pipeline is the core technical infrastructure through which the coordinator transforms raw domain signals into unified intelligence products. The pipeline operates in four stages: signal collection, entity correlation, assessment synthesis, and product distribution.

Signal collection aggregates incoming intelligence signals from all contributing domains through the platform's event system. Each signal arrives with source metadata including the originating domain, collection timestamp, source reliability rating, and information confidence assessment. The coordinator normalizes these signals into a common analytical framework that enables cross-domain comparison.

Entity correlation matches signals to entities in the unified entity graph stored in KuzuDB. When a new signal mentions an entity that is already tracked, the coordinator links the signal to the existing entity node, enriching the entity's profile with the new information. When a signal mentions a previously unknown entity, the coordinator creates a new entity node and attempts to link it to existing entities through name matching, identifier correlation, and relationship inference.

Assessment synthesis combines correlated signals into unified intelligence assessments. The coordinator evaluates each assessment against the NABLA axioms, ensuring signal plurality (multiple independent sources), contradiction preservation (conflicting signals are preserved rather than resolved), and provenance traceability (every assessment can be traced back to its source signals). Assessments that meet the platform's confidence threshold are promoted to verified status; those below threshold remain as preliminary assessments with explicit confidence scores.

Product distribution delivers completed intelligence products to authorized consumers through configurable delivery channels. The coordinator supports push delivery (real-time alerts for time-sensitive intelligence), pull delivery (on-demand query responses), and scheduled delivery (periodic summary reports). Access controls enforce need-to-know restrictions, ensuring that intelligence products are delivered only to consumers authorized to receive them.

## Entity Graph Management

The entity graph maintained in KuzuDB is the central data structure through which the coordinator tracks entities and their relationships across domains. The graph contains nodes representing entities (persons, organizations, assets, locations, documents) and edges representing relationships (ownership, employment, geographic proximity, communication, financial transactions).

Graph construction is an ongoing process as new intelligence signals continuously add nodes and edges. The coordinator manages graph evolution carefully, implementing conflict resolution strategies for contradictory signals. When two signals provide conflicting information about an entity (for example, different addresses from different sources), both signals are preserved in the graph with their respective source provenance and confidence ratings. Consumers can inspect the full evidence basis for any entity attribute.

Graph queries enable the coordinator to discover non-obvious relationships between entities. Path-finding algorithms identify connection chains between entities that appear unrelated when viewed within a single domain but are connected through intermediate entities visible only in the cross-domain graph. These discovered connections often represent the highest-value intelligence products, revealing hidden relationships that manual analysis would struggle to identify.

Graph maintenance includes pruning stale information based on configurable time decay policies, merging duplicate entity nodes discovered through improved entity resolution, and recomputing relationship confidence scores as new evidence accumulates. The coordinator runs periodic graph health assessments that identify isolated nodes (entities with no connections that may indicate data quality issues) and overly connected nodes (entities with suspiciously many connections that may indicate entity resolution errors).

## Confidence Scoring Model

The coordinator implements a multi-dimensional confidence scoring model that provides transparent, traceable confidence assessments for every intelligence product. Confidence is not a single number but a vector of scores across several dimensions.

Source reliability assesses the trustworthiness of each contributing source based on historical accuracy, potential biases, and collection methodology. Official government registries receive higher reliability scores than unverified social media posts. The reliability assessment is calibrated against historical validation data where available.

Information quality evaluates the specificity, consistency, and corroboration of the information itself. Specific claims with precise dates and amounts score higher than vague assertions. Information corroborated by multiple independent sources scores higher than single-source claims. The NABLA Signal Plurality axiom operationalizes this principle by requiring minimum source counts for different confidence tiers.

Temporal freshness penalizes information that has not been refreshed recently. The decay rate varies by information type: corporate registration data changes infrequently and decays slowly, while financial transaction data is highly dynamic and decays rapidly. The coordinator's time decay model ensures that stale information is flagged as potentially outdated rather than presented as current.

Assessment completeness measures the fraction of relevant questions that have been addressed by available evidence. A comprehensive assessment that addresses all relevant aspects of an entity scores higher than a partial assessment that covers only financial data while ignoring legal and OSINT dimensions.

## Cross-Domain Pattern Detection

Pattern detection across domains reveals intelligence insights that are invisible within any single domain. The coordinator implements several pattern detection methodologies that operate across the unified entity graph.

Temporal pattern detection identifies coordinated activities across domains that share timing characteristics. For example, a series of corporate registrations in multiple jurisdictions within a short time window, combined with simultaneous domain name registrations and social media account creation, may indicate a coordinated entity establishment campaign that would not be apparent from any single domain's perspective.

Structural pattern detection identifies recurring relationship topologies in the entity graph. Common patterns include hub-and-spoke ownership structures, circular ownership chains, and layered intermediary structures that may indicate beneficial ownership obfuscation. The coordinator maintains a library of known structural patterns and alerts analysts when new instances are detected.

Anomaly detection identifies entities and relationships that deviate significantly from established norms. A company with no employees, no web presence, and no physical office but receiving large financial transfers represents an anomaly that warrants investigation. The coordinator computes anomaly scores based on deviation from peer group baselines across multiple dimensions.

## Authority Level

**L3** - Strategic Command - Multi-domain coordination and specialized operational command with authority to direct intelligence collection priorities, set confidence thresholds, and manage the unified entity graph.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [email-intelligence-specialist](/agents/email-intelligence-specialist/) | Signal Source | Provides email-derived intelligence signals for cross-domain correlation |
| [czech-business-intelligence-specialist](/agents/czech-business-intelligence-specialist/) | [Registry](/glossary/registry-otp/) Source | Feeds Czech business registry data into the intelligence fusion pipeline |
| [intelligence-export-coordinator](/agents/intelligence-export-coordinator/) | Output [Channel](/glossary/channel/) | Manages export and distribution of synthesized intelligence products |
| [cross-border-identity-specialist](/agents/cross-border-identity-specialist/) | Identity Resolution | Provides cross-jurisdictional identity matching for entity graph enrichment |
| [delta-force-specialist](/agents/delta-force-specialist/) | Precision Operations | Executes targeted intelligence collection missions based on coordinator priorities |

## Enforcement

All intelligence operations are governed by [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. No intelligence assessment reaches consumers without meeting [Trinity Gate](/glossary/trinity-gate/) validation requirements: structural consistency of the evidence graph, logical consistency of inferences, and [formal verification](/glossary/formal-verification/) of critical claims. Single-source intelligence is flagged as preliminary and blocked from distribution as verified assessment. The NABLA Contradiction Preservation axiom prevents conflicting signals from being silently discarded. Intelligence products that fail confidence threshold requirements are returned to the fusion pipeline for additional evidence collection rather than released with inadequate support.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)