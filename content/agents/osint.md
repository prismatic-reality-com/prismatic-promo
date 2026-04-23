+++
title = "OSINT Intelligence Agents"
weight = 2
[extra]
icon = "search"
color = "blue"
agent_count = 62
commands = ["/investigate", "/email-osint", "/google-hacking", "/person-investigate"]
description = "Multi-source intelligence gathering across 27 EU countries"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2100
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["OSINT", "Intelligence", "Agents", "Multi-source", "Prismatic Platform", "The OSINT", "Czech", "Justice"]
tags = ["agents", "osint-intelligence-agents", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "OSINT Intelligence Agents - Prismatic Platform"
+++

## Overview

OSINT (Open Source Intelligence) agents form the reconnaissance backbone of the Prismatic Platform, constituting one of the largest and most operationally diverse agent domains with 62 specialized agents. These agents gather, correlate, and analyze publicly available information from hundreds of sources across 27 EU member states, producing structured intelligence products that support due diligence investigations, risk assessments, and competitive intelligence operations. The OSINT domain operates under the [NABLA Infinity](/glossary/nabla-infinity/) epistemic framework, enforcing signal plurality and source independence axioms that ensure intelligence products reflect verified reality rather than single-source assumptions.

The domain's architecture follows a layered collection-analysis-production pipeline where specialized collector agents feed raw data into correlation engines that produce finished intelligence. Every intelligence product carries full provenance chains traceable to original sources, explicit confidence scores, and temporal validity markers. This rigorous epistemic discipline distinguishes Prismatic's OSINT capabilities from conventional web scraping or data aggregation tools, producing intelligence that meets the evidentiary standards required for legal proceedings, regulatory compliance, and executive decision-making.

## Agent Roster

| Agent | Level | Role | Specialization |
|-------|-------|------|----------------|
| **ghost-recon** | L3 | Stealth OSINT | Low-profile reconnaissance with minimal digital footprint |
| **delta-force** | L3 | Precision OSINT | Targeted entity investigation with surgical scope control |
| **navy-seal** | L3 | Deep-water OSINT | Breach correlation, dark web monitoring, credential exposure |
| **green-beret** | L3 | Unconventional OSINT | Non-standard sources, regional expertise, cultural context |
| **falcon-strike** | L3 | Rapid Multi-vector | Fast parallel investigation across multiple source categories |
| **siege-master** | L3 | Long-term Intel | Extended surveillance campaigns with temporal pattern analysis |

## Key Capabilities

### Multi-Source Intelligence

The OSINT domain maintains active integrations with hundreds of data sources across multiple categories, providing comprehensive coverage of publicly available information relevant to entity investigation and risk assessment.

| Source Category | Examples | Coverage |
|-----------------|----------|----------|
| **Government Registries** | ARES, Justice.cz, Katastr, EU business registers | 27 EU countries |
| **Corporate Data** | Company registrations, ownership chains, beneficial owners | Full beneficial owner chains |
| **Financial** | Insolvency registers, liens, court judgments, sanctions lists | [Real-time monitoring](/capabilities/real-time-monitoring/) |
| **Social Media** | LinkedIn, Facebook, Twitter, professional networks | Profile correlation and history |
| **Technical** | DNS, [WHOIS](/glossary/whois/), certificates, IP geolocation | Infrastructure mapping |
| **Breach Data** | HIBP, leaked databases, credential exposure monitoring | Continuous scanning |
| **Legal** | Court records, regulatory actions, administrative proceedings | Multi-jurisdiction |
| **Media** | News archives, press releases, public statements | Sentiment and temporal analysis |

### Email OSINT Pipeline

The email OSINT pipeline transforms a single email address into a comprehensive intelligence dossier by systematically querying and correlating information from multiple independent sources. The pipeline operates in parallel streams to minimize collection latency while maximizing intelligence yield.

```
Email Input --> Domain Extraction --> MX Analysis --> HIBP Check
    |              |                  |            |
Social Lookup  DNS Records    Mail Provider   Breaches
    |              |                  |            |
        |----------+------------------+------------|
                           |
                   Correlation Engine
                           |
                   Intelligence Report
```

The correlation engine applies [entity resolution](/glossary/entity-resolution/) algorithms to connect discovered identifiers across source categories, building a unified entity profile from fragmentary data. Email-derived intelligence often serves as the seed for broader person or organization investigations, providing the initial anchor points from which relationship networks are expanded.

### Google Hacking and Advanced Search

Advanced search operators provide a non-invasive method for discovering exposed information assets that organizations may not intend to be publicly accessible. The OSINT domain maintains a curated library of search operator combinations optimized for specific discovery objectives.

Discovery categories include:
- **Exposed documents** -- Sensitive files indexed by search engines (filetype:pdf, filetype:xlsx, filetype:docx)
- **Login portals** -- Administrative interfaces accessible from the public internet (inurl:admin, inurl:login, inurl:dashboard)
- **Database dumps** -- Accidentally exposed database files (ext:sql, ext:db, ext:bak)
- **Configuration files** -- Application and infrastructure configurations (ext:conf, ext:env, ext:yaml)
- **API keys and credentials** -- Hardcoded authentication material in public repositories and cached pages
- **Infrastructure exposure** -- Server status pages, directory listings, debug endpoints

### Czech Republic Specialized Coverage

The OSINT domain maintains deep integration with Czech public registries, providing comprehensive coverage of the Czech business and legal landscape. This includes full ARES (Administrative Register of Economic Subjects) integration for company registration data, Justice.cz for court and insolvency records, ISIR for insolvency proceedings, and CUZK (Czech Office for Surveying, Mapping and Cadastre) for property ownership records.

Czech-specific capabilities extend to beneficial ownership chain resolution through the Czech UBO register, cross-referencing company officers across multiple registries, and tracking corporate restructuring events including mergers, splits, and transformations through historical registry snapshots.

## Integration Points

- **Czech [Registry](/glossary/registry-otp/)**: Full ARES, Justice.cz, Land Registry, and ISIR integration with automated data refresh
- **EU Sources**: Cross-border company registry access spanning all 27 member states with multilingual entity resolution
- **Breach Correlation**: Automatic HIBP and custom breach database checking with temporal exposure tracking
- **Report Generation**: Automated intelligence report creation with configurable templates and classification levels
- **[KuzuDB](/glossary/kuzudb/) Graph Storage**: All entity relationships stored in graph database for network analysis and traversal queries
- **[EASM](/glossary/easm/) Pipeline**: Technical OSINT findings feed directly into External Attack Surface Management workflows

## Architecture

The OSINT domain follows a three-tier architecture separating collection, analysis, and production concerns. The collection tier comprises specialized source adapters that normalize raw data into canonical internal representations. The analysis tier applies correlation algorithms, confidence scoring, and entity resolution to produce enriched intelligence objects. The production tier formats intelligence into structured reports, dashboard visualizations, and API responses.

Each tier operates under independent [supervision trees](/glossary/supervision-tree/) with [circuit breaker](/glossary/circuit-breaker/) patterns isolating external source failures from the analysis and production layers. Source adapter failures trigger graceful degradation rather than investigation failure, with reduced-confidence results clearly marked to indicate which sources were unavailable during collection.

## Commands

| Command | Description | Authority |
|---------|-------------|-----------|
| `/investigate` | Comprehensive multi-source investigation with full correlation | L2+ |
| `/email-osint` | Email-based intelligence gathering pipeline | L2+ |
| `/google-hacking` | Advanced Google search operators for exposure discovery | L2+ |
| `/person-investigate` | Individual person investigation with registry cross-referencing | L2+ |
| `/ghost-recon` | Stealth reconnaissance mode with minimal footprint | L3 |
| `/delta-force` | Precision targeted investigation with surgical scope | L3 |

## Epistemic Standards

All OSINT intelligence products adhere to the [NABLA Infinity](/glossary/nabla-infinity/) axiom set. The signal plurality axiom requires that entity attributions and relationship claims are corroborated from at least two independent sources. The contradiction preservation axiom ensures that conflicting information from different sources is preserved and flagged rather than silently resolved. The provenance mandatory axiom guarantees that every claim in an intelligence product is traceable to its original source with collection timestamp and access method documented.

## Enforcement

Intelligence products that fail to meet epistemic standards are blocked from publication under the [NO MERCY](/glossary/no-mercy/) doctrine. The [NO DOUBTS](/glossary/no-doubts/) principle requires that confidence scores accurately reflect the evidence base, with no inflation of confidence beyond what the collected evidence supports. All OSINT operations are logged with immutable audit trails for compliance and accountability purposes.

## Related Agents

The OSINT domain interfaces with virtually every other domain in the Prismatic Platform, providing the foundational intelligence that supports risk assessment, compliance verification, security operations, and strategic decision-making across the entire agent ecosystem.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)