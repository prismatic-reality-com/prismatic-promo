+++
title = "person-investigation-mycelial-agent"
weight = 300
[extra]
domain = "osint/czech"
level = "L3"
description = "Orchestrates comprehensive person investigations using Czech public registries (ARES, Justice.cz, ISIR, ČÚZK) with full mycelial network integration for pattern learning, cross-..."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["osint", "easm", "entity-resolution", "nabla-infinity", "trinity-gate", "aiad", "garden", "kuzudb", "attack-surface", "no-doubts"]
domain_normalized = "osint"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2200
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["person-investigation-mycelial-agent", "Orchestrates", "Czech", "ARES", "Justicecz", "ISIR", "agents", "agent", "Prismatic Platform", "Justice"]
tags = ["agents", "agent", "person-investigation-mycelial-agent", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "person-investigation-mycelial-agent - Prismatic Platform"
+++

## Overview

The Person Investigation Mycelial Agent operates as an L3 [Strategic Command](/glossary/strategic-command/) authority within the Prismatic Platform's [OSINT](/glossary/osint/)/Czech domain, orchestrating comprehensive person investigations using Czech public registries with full [mycelial network](/glossary/mycelial-network/) integration for pattern learning and cross-investigation knowledge sharing. This agent combines deep integration with Czech government data sources (ARES, Justice.cz, ISIR, CUZK) with the platform's biologically-inspired knowledge network, enabling each investigation to benefit from patterns discovered in previous investigations and to contribute new patterns that improve future investigative capabilities.

Built on the [AIAD](/glossary/aiad/) standard and governed by the [NABLA Infinity](/glossary/nabla-infinity/) epistemic framework, the agent enforces rigorous multi-source corroboration for all investigative findings. The signal plurality axiom requires that no claim about a person's identity, associations, or activities is established without evidence from at least two independent sources. All findings carry explicit confidence scores, temporal validity markers, and full provenance chains enabling traceability to original registry records.

## Theoretical Foundations

Person investigation in the Czech Republic context requires understanding the country's distinctive public registry landscape. The Czech Republic maintains an unusually comprehensive set of publicly accessible data sources compared to many EU member states, including the ARES system (Administrative Register of Economic Subjects) which aggregates data from multiple underlying registries, the Justice.cz portal providing court records and company officer information, the ISIR insolvency register, and the CUZK land registry.

The [entity resolution](/glossary/entity-resolution/) challenge in Czech person investigation is complicated by several factors: the relatively small set of common Czech surnames creates high ambiguity, the use of grammatical gender in name declension means the same person's name appears in different grammatical forms depending on context, and the distinction between permanent residence (trvaly pobyt) and temporary residence creates multiple address associations per person.

The mycelial network integration addresses these challenges by accumulating cross-investigation knowledge. When one investigation resolves an ambiguous identity, the resolution pattern is propagated through the mycelial network, making it available to future investigations encountering similar ambiguity patterns. Over time, this creates a growing knowledge base of resolution strategies that progressively reduces investigation time and improves accuracy.

## Operational Domain

The OSINT/Czech domain covers person investigation across all Czech public registries, with capabilities extending to cross-border investigation through EU registry interconnections. The agent's primary data sources include:

| Registry | Data Type | Access Method |
|----------|-----------|---------------|
| **ARES** | Company registrations, officer roles, addresses | API + web scraping |
| **Justice.cz** | Court records, company filings, insolvency | Web scraping |
| **ISIR** | Insolvency proceedings, creditor claims | API |
| **CUZK** | Property ownership, land registry, cadastral maps | API + web access |
| **OR (Obchodni rejstrik)** | Company register, beneficial ownership | API |
| **Zivnostensky rejstrik** | Trade license register | API |

The domain also encompasses social media analysis, professional network investigation, and publicly available financial information to complement registry data.

## Key Capabilities

- **Multi-registry person search** -- Simultaneously queries all Czech public registries for a target person, correlating results through entity resolution to build a unified person profile from fragmentary registry data

- **Corporate association mapping** -- Traces all company officer positions (executive, board member, supervisory board, prokura) held by a target person across all registered Czech companies, including historical positions no longer active

- **Property ownership investigation** -- Queries the CUZK land registry to identify real estate assets associated with a target person, including ownership shares, liens, and historical ownership changes

- **Insolvency and court record analysis** -- Searches ISIR for insolvency proceedings and Justice.cz for court records involving the target, providing financial risk indicators

- **Relationship network construction** -- Builds graph-based relationship networks stored in [KuzuDB](/glossary/kuzudb/) connecting the target person to associated individuals, companies, and properties through registry-documented relationships

- **Mycelial pattern learning** -- Each investigation contributes discovered patterns to the [mycelial network](/glossary/mycelial-network/), and new investigations automatically benefit from previously learned resolution strategies, entity disambiguation heuristics, and registry-specific data quality patterns

- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with self-directed investigation workflows that expand scope based on discovered leads

## Authority Level

**L3** - Strategic Command - Multi-domain coordination with authority to orchestrate multi-registry investigation campaigns and publish intelligence products for downstream consumption.

## Investigation Workflow

The agent follows a structured investigation methodology:

1. **Seed Input Processing** -- Accept and normalize person identifiers (name, birth date, birth number, address)
2. **Registry Enumeration** -- Query all applicable Czech registries with the normalized identifiers
3. **Entity Resolution** -- Apply disambiguation algorithms to resolve potentially matching records into confirmed, probable, possible, and unverified identity associations
4. **Association Expansion** -- For confirmed identities, expand the investigation to discover corporate roles, property ownership, court records, and insolvency proceedings
5. **Relationship Mapping** -- Construct graph-based relationship networks connecting the target to associated entities
6. **Confidence Scoring** -- Assign confidence scores to all findings based on source reliability, corroboration count, and data freshness
7. **Mycelial Integration** -- Contribute discovered patterns and resolved entities to the mycelial network for cross-investigation knowledge sharing
8. **Report Generation** -- Produce structured intelligence report with findings, confidence levels, and evidence trails

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/person-investigate` | Initiate comprehensive person investigation | L2+ |
| `/person-investigate --deep` | Extended investigation with all registry sources | L3+ |
| `/person-investigate --network` | Focus on relationship network construction | L3+ |
| `/person-investigate --property` | Focus on property ownership investigation | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [primary-identity-verification-commander](/agents/primary-identity-verification-commander/) | Identity verification provides confirmed entity identifiers for investigation |
| [political-network-intelligence-specialist](/agents/political-network-intelligence-specialist/) | Person investigation results feed political network analysis |
| [osint-technical-security-specialist](/agents/osint-technical-security-specialist/) | Technical security findings correlated with person investigation data |
| [risk-intelligence-commander](/agents/risk-intelligence-commander/) | Investigation findings inform individual risk assessments |

## Mycelial Network Integration

The mycelial integration is bidirectional. During investigation, the agent queries the mycelial network for previously discovered patterns relevant to the current target: known entity disambiguation resolutions, registry-specific data quality issues, and relationship patterns common in the target's industry or geographic area. After investigation completion, the agent contributes new patterns including successful disambiguation strategies, newly discovered data quality issues in specific registries, and relationship patterns that may be relevant to future investigations.

Pattern propagation through the mycelial network follows confidence-weighted routing: high-confidence patterns are propagated broadly, while lower-confidence patterns are propagated only to closely related investigation contexts where they are most likely to be relevant. This prevents low-quality patterns from contaminating unrelated investigations while ensuring that valuable patterns reach all potentially benefiting contexts.

## Enforcement

All investigation outputs comply with the [NO MERCY](/glossary/no-mercy/) doctrine: no investigation is published without complete evidence chains, and all findings pass [Trinity Gate](/glossary/trinity-gate/) validation. The [NO DOUBTS](/glossary/no-doubts/) principle ensures that confidence scores accurately reflect the evidence base. Privacy compliance is enforced through data handling rules that ensure all collected data is from legitimate public sources and processed in accordance with applicable privacy regulations.

## Related Agents

Agents in the **osint/czech** domain collaborate to provide comprehensive Czech intelligence coverage, with the Person Investigation Mycelial Agent serving as the primary entry point for person-focused investigations that leverage the full depth of Czech public registry data.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)