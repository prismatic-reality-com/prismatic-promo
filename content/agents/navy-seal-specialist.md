+++
title = "Navy SEAL Specialist"
weight = 273
[extra]
domain = "intelligence"
level = "L3"
description = "Specialized deep/dark web intelligence operations with advanced Tor and hidden service navigation"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["osint", "entity-resolution", "nabla-infinity", "trinity-gate", "aiad", "kuzudb", "postgresql", "no-doubts", "seadf", "telemetry"]
domain_normalized = "intelligence"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2200
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Navy", "SEAL", "Specialist", "Specialized", "agents", "agent", "Prismatic Platform", "Dark", "IOCs", "Freenet"]
tags = ["agents", "agent", "navy-seal-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Navy SEAL Specialist - Prismatic Platform"
+++

## Overview

The Navy SEAL Specialist operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's intelligence domain, providing specialized capabilities for deep and dark web intelligence operations. Named after the elite military special operations forces known for operating in the most demanding environments, this agent specializes in navigating the hidden layers of the internet -- Tor hidden services, I2P networks, Freenet nodes, and other overlay networks -- to collect [OSINT](@/glossary/osint.md) intelligence that is inaccessible through conventional surface web collection methods. This capability is essential for comprehensive threat intelligence, brand protection monitoring, and due diligence investigations where relevant information exists outside the indexed web.

Built on the [AIAD](@/glossary/aiad.md) standard and integrated with the platform's intelligence infrastructure, the specialist implements advanced navigation techniques for anonymous networks while maintaining strict operational security. All operations are conducted within the bounds of authorized intelligence collection: no active exploitation, no unauthorized access, and no interference with discovered services. The [NO DOUBTS](@/glossary/no-doubts.md) principle governs all intelligence assessments: information collected from deep/dark web sources undergoes rigorous validation through the [NABLA Infinity](@/glossary/nabla-infinity.md) framework, with source reliability adjustments that account for the inherently lower trust levels of anonymous network intelligence.

## Theoretical Foundations

Deep and dark web intelligence collection draws from network anonymization theory, onion routing protocols, and intelligence tradecraft methodologies. The specialist's operational framework distinguishes between three internet layers relevant to intelligence collection. The **surface web** comprises publicly indexed content accessible through standard search engines. The **deep web** includes content behind authentication walls, dynamic databases, and unindexed resources that require specialized queries or credentials to access. The **dark web** consists of content hosted on overlay networks (primarily Tor, I2P, and Freenet) that are designed to resist identification and censorship.

The specialist applies intelligence collection disciplines adapted from traditional signals intelligence (SIGINT) and human intelligence (HUMINT) frameworks to the digital domain. Collection operations follow the intelligence cycle: requirements definition, collection planning, source identification, data acquisition, processing, analysis, and dissemination. Source credibility assessment in anonymous environments applies modified versions of the Admiralty Code (source reliability x information credibility matrix), adjusted for the unique characteristics of anonymous network intelligence where source identity is intentionally obscured.

[Entity resolution](@/glossary/entity-resolution.md) in dark web contexts presents unique challenges: entities frequently use multiple identities, pseudonyms change over time, and traditional identification attributes (real names, addresses, corporate registrations) are deliberately hidden. The specialist applies behavioral fingerprinting, linguistic analysis, temporal pattern matching, and cryptocurrency transaction correlation to link entities across identities and platforms.

## Operational Domain

The intelligence domain for this specialist covers all deep and dark web collection activities within the platform's authorized scope. Operations include monitoring dark web marketplaces for brand abuse and intellectual property theft, tracking threat actor communications in forums and chat channels, identifying leaked credentials and data breaches, and collecting indicators of compromise (IOCs) from underground sources. All collection activities operate under strict authorization controls and comply with applicable legal frameworks.

The specialist maintains a continuously-updated map of relevant dark web services, including Tor hidden service directories, I2P sites, paste sites, forums, and marketplaces. Service availability is tracked through periodic probing, with discovered services catalogued in the platform's [KuzuDB](@/glossary/kuzudb.md) graph database for relationship analysis. [PostgreSQL](@/glossary/postgresql.md) stores structured intelligence artifacts including entity profiles, IOCs, and collection metadata.

## Key Capabilities

- **Tor hidden service navigation** -- Discovers, accesses, and monitors Tor .onion services including marketplaces, forums, and paste sites, maintaining operational security through circuit management and traffic pattern obfuscation
- **Multi-network collection** -- Operates across Tor, I2P, Freenet, and ZeroNet overlay networks, adapting collection techniques to the specific anonymization and addressing characteristics of each network
- **Dark web entity resolution** -- Links entities across multiple dark web identities using behavioral fingerprinting, linguistic analysis, temporal correlation, and transaction pattern matching, building unified entity profiles from fragmented identity data
- **Credential leak monitoring** -- Tracks dark web markets and paste sites for leaked credentials, data breaches, and exposed corporate information relevant to protected organizations
- **Threat actor profiling** -- Builds comprehensive profiles of threat actors operating in dark web environments, tracking their capabilities, motivations, affiliations, and historical activities
- **Indicator of compromise extraction** -- Identifies and extracts IOCs (IP addresses, domains, hashes, patterns) from dark web sources, enriching threat intelligence feeds with underground-sourced indicators
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with self-directed collection cycles that adapt to dark web service availability and intelligence requirement priorities
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** publishing collection metrics including source coverage, collection success rates, entity resolution confidence, and intelligence freshness

## Authority Level

**L3** - Strategic Command - Multi-domain coordination with authority to conduct deep/dark web collection operations, manage collection priorities, and coordinate with other intelligence agents for multi-source analysis.

## Operational Security Framework

All dark web operations follow strict operational security (OPSEC) protocols. Network access occurs through dedicated Tor circuits with configurable guard node selection and circuit rotation policies. Traffic analysis resistance is maintained through traffic padding and timing obfuscation. No personally identifiable information is transmitted during collection operations. Collection infrastructure is isolated from the platform's production network through dedicated network segments.

The OPSEC framework defines four operational modes with increasing security levels. **Passive monitoring** observes publicly accessible dark web content without interaction. **Active collection** submits queries or navigates interactive services while maintaining anonymity. **Engagement** involves limited interaction with dark web entities for intelligence purposes under strict authorization. **Deep cover** operations require explicit authorization for extended engagement with dark web communities and are subject to additional oversight.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/navy-seal collect` | Initiate a targeted deep/dark web collection operation | L3+ |
| `/navy-seal monitor` | Configure ongoing monitoring of specified dark web services | L3+ |
| `/navy-seal entities` | Display dark web entity profiles with cross-identity resolution | L3+ |
| `/navy-seal threats` | Show current threat actor profiles and activity summaries | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [osint-intelligence-operative](@/agents/osint-intelligence-operative.md) | Coordinates deep/dark web intelligence with surface web OSINT for comprehensive analysis |
| [osint-engines-specialist](@/agents/osint-engines-specialist.md) | Dark web IOCs are cross-referenced with surface web search engine intelligence |
| [osint-digital-profile-specialist](@/agents/osint-digital-profile-specialist.md) | Dark web identity fragments contribute to comprehensive digital profile construction |
| [network-security-specialist](@/agents/network-security-specialist.md) | Dark web-sourced threat intelligence informs network security posture |
| [osint-legal-economic-risk-specialist](@/agents/osint-legal-economic-risk-specialist.md) | Dark web findings contribute to legal and economic risk assessments |

## Intelligence Validation

Intelligence collected from dark web sources undergoes enhanced validation through the [NABLA Infinity](@/glossary/nabla-infinity.md) framework. Source reliability is initially rated lower than surface web sources due to the inherent anonymity and deception risks in dark web environments. Reliability scores are upgraded as dark web intelligence is corroborated by independent sources (surface web OSINT, commercial threat feeds, or other dark web sources). The [Trinity Gate](@/glossary/trinity-gate.md) validates that dark web intelligence assessments maintain structural consistency with the platform's entity graph, logical consistency with known threat landscapes, and formal consistency with intelligence reporting standards.

## Enforcement

Operations comply with the [NO MERCY](@/glossary/no-mercy.md) doctrine: no intelligence artifact is published without source assessment, no entity profile is released without confidence scoring, and no threat assessment is disseminated without validation against the NABLA axiom framework. All collection activities carry complete provenance chains per the provenance mandatory axiom, and all intelligence outputs include explicit confidence levels per the unknown valid axiom.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)