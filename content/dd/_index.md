+++
title = "Due Diligence Intelligence"
description = "Comprehensive due diligence platform with 122 OSINT sources, graph analysis, and triple-checked cross-validation"
sort_by = "weight"
template = "dd/list.html"
page_template = "dd/page.html"

[extra]
date_created = "2026-02-17"
section_icon = "shield-check"
total_tools = 122
czech_registries = 30
validation_method = "triple-check"
risk_grades = "A-F"
total_topics = 11
entity_types = 8
platform_version = "v8.0"
key_features = ["Triple-Check Validation", "Graph Traversal", "Czech Registry Integration", "M&A Workflow", "Risk Assessment", "Compliance Framework"]
author = "Tomas Korcak (korczis)"
reading_time = "25 min"
word_count = 3800
difficulty = "intermediate"
image = "/images/sections/dd.png"
image_alt = "Prismatic Platform Due Diligence Intelligence architecture"
og_type = "article"
twitter_card = "summary_large_image"
academic_tier = "whitepaper"
content_version = "2.0.0"
last_enhanced = "2026-02-22"
quality_score = 98
tags = ["due-diligence", "compliance", "risk-assessment", "osint", "kyc", "aml", "czech-registries", "graph-analysis"]
see_also = ["osint", "agents", "capabilities", "glossary", "academy", "lab", "api"]
date_modified = "2026-02-23"
keywords = ["Due", "Diligence", "Intelligence", "Comprehensive", "OSINT", "Prismatic Platform", "Czech", "Advanced", "Justice"]
+++

## Perex

The Prismatic Platform transforms due diligence investigations through intelligent automation, comprehensive data integration, and rigorous validation methodologies. Our DD Intelligence capability combines 122 OSINT source adapters with deep Czech registry connectivity, graph-based relationship analysis, and triple-checked cross-validation to deliver actionable insights for compliance officers, M&A analysts, legal professionals, and investigators.

From entity discovery through final risk assessment, every component has been purpose-built for professional due diligence workflows that satisfy regulatory requirements across EU and Czech frameworks including NIS2, ZKB 264/2025 Sb., and AML/KYC compliance standards.

## Key Capabilities

**122 OSINT Sources** • **30+ Czech Registries** • **3x Cross-Validation** • **A-F Risk Grades**

The platform integrates intelligence from global and Czech sources, applies triple-check validation across independent data streams, and produces standardized risk assessments that meet regulatory compliance requirements for financial services, critical infrastructure, and government contracting.

### DD Topics Available

| Topic | Difficulty | Duration | Focus Area |
|-------|------------|----------|------------|
| **Triple-Check Cross-Validation Methodology** | Advanced | 12 min | Validation Framework |
| **Entity Management System** | Intermediate | 14 min | Data Architecture |
| **Czech Registry Deep Integration** | Advanced | 15 min | Registry Connectivity |
| **Graph Analysis and Relationship Traversal** | Advanced | 13 min | Network Analysis |
| **Case Management and Investigation Workflow** | Intermediate | 13 min | Process Management |
| **Risk Assessment Framework** | Advanced | 14 min | Risk Modeling |
| **Compliance Framework Integration** | Advanced | 14 min | Regulatory Mapping |
| **OSINT Source Integration Framework** | Advanced | 14 min | Technical Integration |
| **M&A Due Diligence Workflow** | Advanced | 14 min | Transaction Support |
| **Client/Loader Pipeline Architecture** | Advanced | 12 min | Data Pipeline |
| **Platform Architecture and Technical Implementation** | Advanced | 14 min | System Design |

### Platform Statistics

- **Total Topics**: 11 comprehensive training modules
- **OSINT Sources**: 122 intelligence adapters across 7 categories
- **Czech Registries**: 30+ official government data sources
- **Entity Types**: 8 supported entity classes (Person, Company, Domain, Email, Phone, IP, Crypto, Document)
- **Platform Version**: Prismatic v8.0 (Gen 19 Ecosystem Expansion)

### Quick Navigation

- **[OSINT Sources](@/osint/_index.md)** - 122 intelligence sources powering DD investigations
- **[Academy](@/academy/_index.md)** - Learn DD investigation techniques step by step
- **[Lab](@/lab/_index.md)** - Experiment with OSINT pipelines and graph analysis
- **[API Reference](@/api/_index.md)** - Programmatic access to DD and OSINT endpoints
- **[Agents](@/agents/_index.md)** - 434 autonomous agents driving investigations

### Explore Platform

| Component | Count | Description |
|-----------|-------|-------------|
| **OSINT Sources** | 122+ | Intelligence adapters across Czech, Global, Sanctions, and specialized sources |
| **Interactive Labs** | 15+ | Hands-on experiments with OSINT pipelines and graph analysis |
| **Academy Courses** | 15+ | Structured learning paths for DD platform mastery |
| **API Endpoints** | 200+ | Programmatic access to all DD and OSINT capabilities |
| **Agents** | 434 | Autonomous agents driving investigations and analysis |
| **Applications** | 106 | Specialized apps for different DD workflows |
| **Glossary Terms** | 225+ | Comprehensive terminology and cross-references |
| **Color Teams** | 6 | Red/Blue/Purple/White/Gray/Black security operation teams |

### Platform at a Glance

- **Agents**: 434 autonomous intelligence agents
- **Commands**: 217 operational commands and workflows
- **Applications**: 106 specialized DD and OSINT apps
- **OSINT Sources**: 122+ intelligence sources across 7 categories
- **Quality Score**: 100/100 (Perfect compliance with NO MERCY standards)

### Want to Know More?

Dive deeper into the Prismatic Platform -- explore our [architecture](@/architecture/_index.md), [agent ecosystem](@/agents/_index.md), and [epistemic framework](@/capabilities/_index.md) that powers intelligent due diligence at scale.

**About Prismatic**: [Agent Ecosystem (434)](@/agents/_index.md) • [Architecture Overview](@/architecture/_index.md) • [Platform Capabilities](@/capabilities/_index.md)

---

## Introduction

Due diligence -- the systematic investigation and evaluation of a business, individual, or asset prior to a transaction or engagement -- has evolved from a predominantly manual, document-review process into a data-intensive discipline requiring real-time access to hundreds of intelligence sources, sophisticated entity resolution algorithms, and evidence-grade verification pipelines. Modern due diligence demands not merely the collection of data, but its rigorous cross-validation across independent sources, temporal analysis for pattern detection, and structured risk assessment that can withstand regulatory scrutiny.

The Prismatic Platform addresses these demands through a purpose-built DD Intelligence architecture that treats due diligence as a first-class investigative workflow rather than an afterthought bolted onto generic search tools. Every component -- from entity creation through graph traversal to final report generation -- has been designed with the specific requirements of compliance, legal, and financial due diligence in mind.

### The Due Diligence Challenge

Organizations conducting due diligence face several fundamental challenges that conventional tools fail to address adequately:

**Data Fragmentation**: Relevant information about investigation targets is scattered across dozens of registries, databases, and public records systems. A single Czech company might have records in ARES, the Commercial Register at Justice.cz, the Insolvency Register (ISIR), the Trade Licensing Register (RZP), the Land Registry (CUZK), the Contract Register, the VAT Payer Registry, and multiple sector-specific regulatory databases. Manually querying each system, normalizing response formats, and cross-referencing results is prohibitively time-consuming and error-prone.

**Entity Resolution**: Real-world entities frequently appear under variations of their names, addresses, and identification numbers across different systems. A company may be registered under its full legal name in one registry, a trade name in another, and an abbreviated form in a third. Natural persons may have different name orderings, diacritical marks, or transliterations across Czech and international systems. Resolving these variations into a single canonical entity requires sophisticated matching algorithms that balance precision against recall.

**Verification Depth**: Surface-level data collection without cross-validation produces due diligence reports of questionable reliability. A company's self-reported ownership structure may differ from what the Commercial Register shows, which may in turn differ from what beneficial ownership registries reveal. Only by systematically triangulating information across independent sources can an analyst establish confidence in their findings.

**Temporal Dynamics**: Due diligence is not a point-in-time snapshot but a temporal investigation. Ownership changes, insolvency proceedings, sanctions designations, and regulatory actions unfold over time. An effective DD platform must capture and present the temporal dimension of entity data, enabling analysts to identify patterns such as rapid ownership changes preceding financial distress, or the sudden appearance of politically exposed persons in corporate structures.

**Regulatory Compliance**: Due diligence reports must satisfy specific regulatory requirements that vary by jurisdiction and context. European financial institutions must comply with the EU's Anti-Money Laundering Directives (AMLD), the NIS2 Directive for cybersecurity, and national implementations such as the Czech ZKB 264/2025 Sb. The DD platform must structure its outputs to map cleanly onto these regulatory frameworks.

## Platform Architecture

The Prismatic DD Intelligence subsystem is built on the Elixir/OTP stack, leveraging the BEAM virtual machine's strengths in concurrent processing, fault tolerance, and distributed state management. The architecture comprises six primary subsystems that work together to deliver end-to-end due diligence capability.

### Entity Management Layer

At the core of the DD architecture is the Entity Management Layer, which provides a typed, versioned representation of all investigation subjects. The platform supports eight primary entity types:

| Entity Type | Description | Primary Identifiers | Key Registries |
|-------------|-------------|---------------------|----------------|
| **Person** | Natural persons under investigation | Name, date of birth, national ID | Justice.cz, ISIR, CUZK |
| **Company** | Legal entities including corporations, LLCs, and partnerships | ICO, DIC, trade name | ARES, Justice.cz, RZP |
| **Domain** | Internet domain names and associated infrastructure | Domain name, registrar | WHOIS, DNS, CT logs |
| **Email** | Email addresses linked to entities | Email address | HIBP, Hunter.io, EmailRep |
| **Phone** | Phone numbers associated with entities | Phone number, country code | Carrier lookup, OSINT |
| **IP Address** | Network addresses linked to infrastructure | IPv4/IPv6 address, ASN | Shodan, Censys, AbuseIPDB |
| **Cryptocurrency** | Blockchain addresses and wallets | Wallet address, chain | Chainalysis, Etherscan |
| **Document** | Legal documents, contracts, filings | Document reference, court | Registr Smluv, Justice.cz |

Each entity instance maintains a complete audit trail of how it was discovered, which sources contributed data, the confidence level of each data point, and the temporal history of changes. Entities are stored in PostgreSQL with full-text search indexing via Meilisearch and relationship traversal via KuzuDB's graph engine.

### OSINT Integration Framework

The DD platform integrates 122 OSINT source adapters organized into seven intelligence categories. Each adapter conforms to the `PrismaticOsintCore.Behaviours.Source` behaviour contract, ensuring consistent error handling, rate limiting, credential management, and telemetry across all sources.

The integration framework operates on a pull-based model: when an entity is created or updated, the platform's orchestration engine determines which OSINT sources are relevant for that entity type and triggers parallel collection across all applicable adapters. Results are normalized into typed `Finding` structs with confidence scores, source attribution, and temporal metadata before being merged into the entity's profile.

**Czech Registry Deep Integration**: The platform maintains specialized adapters for 30+ Czech public registries and information systems, including ARES, Justice.cz, ISIR, RZP, CUZK, Registr Smluv, Hlidac Statu, CEDR, CNB, and sector-specific regulators. These adapters understand the specific data models, query patterns, and update cadences of each Czech system, enabling richer data extraction than generic web scraping approaches.

**Global Intelligence Sources**: Beyond Czech registries, the platform integrates 84+ global intelligence sources spanning infrastructure reconnaissance (Shodan, Censys), threat intelligence (VirusTotal, AlienVault OTX), social intelligence (FullContact, LinkedIn), email verification (Hunter.io, HIBP), domain analysis (SecurityTrails, crt.sh), financial intelligence (SEC EDGAR, OpenCorporates), and cryptocurrency tracking (Chainalysis, Etherscan).

**Sanctions and Compliance**: Three dedicated sanctions screening adapters cover OFAC SDN (US), EU Consolidated Sanctions, and UN Security Council sanctions lists, enabling automated PEP (Politically Exposed Persons) and sanctions screening as part of every investigation.

### Triple-Check Cross-Validation Engine

The platform's signature methodology is triple-checked cross-validation -- a systematic process for establishing confidence in investigative findings by requiring corroboration from at least three independent sources before marking any claim as verified. This methodology is implemented through the NABLA Infinity epistemic framework and its Trinity Gate verification pipeline.

The triple-check process operates at three levels:

1. **Source-Level Validation**: Each individual OSINT source returns data with an initial confidence score based on the source's historical reliability, data freshness, and query specificity. Sources with official authority (e.g., government registries) receive higher base confidence than aggregator services.

2. **Cross-Source Corroboration**: When multiple independent sources return consistent information about the same entity attribute (e.g., a company's registered address), the platform applies Bayesian confidence updating to compute a composite confidence score. Consistency across three or more independent sources significantly elevates confidence, while contradictions between sources trigger investigator alerts.

3. **Temporal Consistency**: The third validation layer examines whether findings are consistent across time. A company address that has been stable for five years across multiple registry snapshots receives higher confidence than one that appears to have changed recently in some sources but not others.

### Graph Analysis Engine

Due diligence investigations inherently involve relationship networks -- the connections between persons, companies, addresses, and assets that reveal ownership structures, control patterns, and risk indicators. The Prismatic DD platform models these relationships as a property graph stored in KuzuDB, enabling sophisticated traversal queries that would be prohibitively complex in relational databases.

The graph engine supports several investigation-critical query patterns:

- **Ownership Chain Traversal**: Starting from a target company, traverse upward through the ownership hierarchy to identify ultimate beneficial owners (UBOs), including through multi-layered holding company structures spanning multiple jurisdictions.
- **Shared Director Networks**: Identify all companies sharing common directors or statutory body members with a target entity, revealing potential conflicts of interest, nominee director patterns, or corporate group structures.
- **Address Clustering**: Detect entities registered at the same address, which may indicate shell companies, virtual office usage, or legitimate shared service arrangements.
- **Temporal Relationship Evolution**: Analyze how entity relationships have changed over time, identifying patterns such as pre-transaction corporate restructuring or post-sanction ownership transfers.

### Case Management System

The Case Management System provides the organizational framework for DD investigations, managing the lifecycle of cases from creation through assignment, investigation, review, and closure. Each case maintains a structured record of the investigation scope, assigned entities, collected evidence, analyst notes, and final assessment.

Cases support hierarchical organization -- a parent M&A due diligence case may contain child cases for individual target entities, each with their own entity graphs and evidence collections. The system enforces role-based access control, ensuring that sensitive investigation details are visible only to authorized analysts and reviewers.

### Risk Assessment Framework

The platform's Risk Assessment Framework translates raw investigative findings into structured risk evaluations using a multi-dimensional scoring model. Risk is assessed across seven dimensions:

| Risk Dimension | Assessment Criteria | Weight |
|----------------|---------------------|--------|
| **Financial** | Insolvency history, unpaid taxes, subsidy dependency | 20% |
| **Legal** | Court proceedings, regulatory actions, sanctions | 20% |
| **Ownership** | Beneficial ownership opacity, nominee structures, PEP connections | 15% |
| **Operational** | Business continuity, key person dependency, supply chain | 15% |
| **Compliance** | Regulatory compliance history, licensing status | 10% |
| **Reputational** | Media sentiment, social signals, industry reputation | 10% |
| **Cyber** | Digital footprint security, data breach history, infrastructure | 10% |

Each dimension produces a normalized score from 0 (minimal risk) to 100 (critical risk), which are weighted and combined into an overall risk rating expressed as a letter grade from A (excellent) through F (critical concern), with a numeric score on a 300-900 scale comparable to industry standards from SecurityScorecard and BitSight.

## Czech Registry Ecosystem

The Prismatic Platform's competitive advantage in the Central European market stems from its deep integration with the Czech registry ecosystem -- the most comprehensive set of public data sources available for entity verification in the Czech Republic.

### Core Registries

The platform connects to the following core Czech registries through dedicated, purpose-built adapters:

- **ARES** (Administrativni registr ekonomickych subjektu): The meta-registry aggregating data from multiple Czech registries into a unified interface. Provides ICO lookup, company search, and basic entity profiles.
- **Justice.cz** (Obchodni rejstrik): The Commercial Register maintained by the Ministry of Justice, containing company formation documents, statutory body composition, registered capital, and historical filings.
- **ISIR** (Insolvencni rejstrik): The Insolvency Register tracking bankruptcy proceedings, restructuring plans, and creditor claims.
- **RZP** (Zivnostensky rejstrik): The Trade Licensing Register documenting business activity licenses, responsible representatives, and trade suspensions.
- **CUZK** (Cesky urad zemericky a katastralni): The Land Registry providing property ownership records, encumbrances, and cadastral data.
- **Registr Smluv**: The Contract Register containing public sector contracts above CZK 50,000, enabling analysis of government contractor relationships.
- **Hlidac Statu**: An independent watchdog aggregating contracts, subsidies, and insolvency data with analytical overlays.
- **CEDR** (Centralni evidence dotaci): The Central Register of Subsidies tracking EU and national subsidy allocations.
- **CNB** (Ceska narodni banka): The Czech National Bank's registry of licensed financial entities.

### Regulatory and Sector-Specific Registries

Beyond the core registries, the platform integrates with sector-specific regulatory databases:

- **DPH Registry**: VAT payer registration and unreliable payer identification
- **SUKL**: Pharmaceutical licensing and product registry
- **ERU**: Energy Regulatory Office license database
- **CTU**: Telecommunications license registry
- **UOHS**: Competition authority decisions and rulings
- **SZIF**: Agricultural subsidy disbursements
- **Verejne zakazky**: Public procurement tender registry

## M&A Due Diligence Workflow

The platform supports end-to-end M&A due diligence through a structured workflow that guides analysts from initial target identification through comprehensive investigation to final deal assessment.

### Workflow Phases

1. **Target Identification**: Create the target entity profile, trigger initial OSINT collection, and establish the entity graph foundation.
2. **Scope Definition**: Define investigation scope, including entity types to investigate, registries to query, and risk dimensions to assess.
3. **Automated Collection**: The platform executes parallel OSINT queries across all relevant sources, normalizing and cross-validating results through the triple-check engine.
4. **Graph Expansion**: Starting from the target entity, the graph engine traverses ownership chains, director networks, and address clusters to identify related entities requiring investigation.
5. **Analyst Review**: Human analysts review automated findings, add contextual notes, and conduct targeted deep-dive investigations on flagged areas.
6. **Risk Assessment**: The Risk Assessment Framework computes dimensional scores and overall risk ratings based on accumulated evidence.
7. **Report Generation**: The platform generates structured DD reports in multiple formats (PDF, HTML, JSON), with findings mapped to relevant regulatory frameworks (NIS2, ZKB, AMLD).
8. **Monitoring**: Post-deal, the platform supports continuous monitoring of investigated entities, alerting analysts to material changes in ownership, financial status, or regulatory standing.

## Compliance Framework Integration

The DD Intelligence subsystem maps its outputs to two primary compliance frameworks relevant to the Central European market:

### NIS2 Directive (EU 2022/2555)

The Network and Information Security Directive requires entities in critical sectors to implement supply chain risk management, including due diligence on suppliers and partners. The Prismatic DD platform directly supports NIS2 compliance by providing structured risk assessments for supply chain entities, with specific attention to cybersecurity posture, operational resilience, and incident history.

### ZKB 264/2025 Sb. (Czech Implementation)

The Czech implementation of the EU cybersecurity framework adds national requirements for entity verification, critical infrastructure supplier assessment, and incident reporting. The platform's DD reports include ZKB-specific compliance sections that map investigation findings to the regulatory requirements defined in Czech law.

## Technical Implementation

The DD subsystem is implemented as a set of Elixir/OTP applications within the Prismatic umbrella:

- `prismatic_dd` -- Core DD business logic, entity management, and case orchestration
- `prismatic_osint_core` -- OSINT adapter framework and source behaviour contracts
- `prismatic_osint_sources` -- 122 individual OSINT source adapter implementations
- `prismatic_storage_kuzudb` -- Graph storage and traversal engine integration
- `prismatic_storage_meilisearch` -- Full-text search indexing for entity and finding data
- `prismatic_perimeter` -- External attack surface management and security ratings

Each component follows the platform's NO MERCY, NO DOUBTS doctrine: zero compilation warnings, comprehensive test coverage, typed function specifications, and production-ready code from the first commit.

## Conclusion

The Prismatic DD Intelligence subsystem represents a purpose-built due diligence platform that combines the breadth of 122 OSINT sources with the depth of 30+ Czech registry integrations, the rigor of triple-checked cross-validation, and the analytical power of graph-based relationship analysis. By automating the data collection and cross-validation phases of due diligence while preserving human judgment for interpretation and risk assessment, the platform enables organizations to conduct more thorough investigations in significantly less time, with higher confidence in the reliability of their findings.

The platform's compliance-aware design ensures that DD reports satisfy the requirements of NIS2, ZKB, and AML/KYC regulations, making it suitable for deployment in regulated industries including financial services, critical infrastructure, and government contracting.

## Related Resources

- [OSINT Intelligence Sources](@/osint/_index.md) -- The 122 OSINT adapters powering DD collection
- [Academy: DD Investigation Techniques](@/academy/dd-investigation.md) -- Structured learning path for DD platform mastery
- [Glossary: Due Diligence](@/glossary/due-diligence.md) -- Formal definition and cross-references
- [Glossary: Entity Resolution](@/glossary/entity-resolution.md) -- Record linkage methodology
- [Glossary: KYC](@/glossary/kyc.md) -- Know Your Customer compliance
- [Glossary: AML](@/glossary/aml.md) -- Anti-Money Laundering regulatory framework
- [Glossary: Triple-Check](@/glossary/triple-check.md) -- Cross-validation methodology
- [Glossary: Beneficial Ownership](@/glossary/beneficial-ownership.md) -- UBO identification
- [Glossary: Sanctions Screening](@/glossary/sanctions-screening.md) -- Regulatory list checking
- [Lab: OSINT Pipeline](@/lab/osint-pipeline.md) -- OSINT pipeline experimentation
- [Building EASM Features](@/academy/easm-development.md) -- Related security assessment development

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
