+++
title = "employee-screening-specialist"
weight = 151
[extra]
domain = "compliance"
level = "L3"
description = "Comprehensive personnel background verification against Czech registries and sanction databases for CER compliance"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["nis2", "zkb", "no-mercy", "no-doubts", "trinity-gate", "aiad", "attack-surface", "telemetry", "ecto", "lean4"]
domain_normalized = "compliance"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2050
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["employee-screening-specialist", "Comprehensive", "Czech", "agents", "agent", "Prismatic Platform", "Screening", "GDPR", "The Employee", "Screening Specialist"]
tags = ["agents", "agent", "employee-screening-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "employee-screening-specialist - Prismatic Platform"
+++

## Overview

The Employee Screening Specialist operates as an L3 [strategic command](/glossary/strategic-command/) agent within the Compliance domain of the Prismatic Platform. This agent performs systematic background verification of personnel against Czech public registries, sanction lists, and regulatory databases to support Critical Entity Resilience (CER) compliance requirements. Employee screening is a mandatory obligation under both the EU [NIS2](/glossary/nis2/) Directive (2022/2555) and Czech [ZKB](/glossary/zkb/) legislation (264/2025 Sb.) for organizations operating critical infrastructure.

Screening operations require careful balance between thoroughness and privacy compliance. The Employee Screening Specialist queries Czech business registries, insolvency registers, and criminal record abstracts through authorized channels while maintaining strict [GDPR](/glossary/gdpr/) compliance throughout the process. Each screening result is produced with explicit confidence scores, source attribution, and temporal validity markers, ensuring that screening decisions are evidence-based and auditable.

The Prismatic Platform's compliance capabilities serve organizations that operate critical infrastructure within Czech and EU jurisdictions. These organizations face regulatory requirements to verify the trustworthiness of personnel who access critical systems, handle sensitive data, or occupy positions of organizational authority. The Employee Screening Specialist automates the verification process that these organizations would otherwise perform manually through fragmented registry access, providing structured, repeatable, and auditable screening workflows.

## Operational Domain

The Compliance domain requires continuous verification of personnel trustworthiness for organizations subject to CER obligations. The Employee Screening Specialist handles individual screening requests, batch processing for organizational onboarding, and periodic re-screening campaigns to detect changes in personnel risk profiles over time. All screening operations produce structured results compatible with audit reporting requirements.

The domain intersects with both the Czech domain (for registry access) and the Intelligence domain (for entity resolution and profile enrichment). The Employee Screening Specialist coordinates with agents in these adjacent domains to obtain comprehensive screening data while maintaining the compliance domain's strict privacy and data handling requirements.

## Key Capabilities

The Employee Screening Specialist provides six core screening capabilities targeting personnel verification requirements.

**Multi-[registry](/glossary/registry-otp/) screening** queries Czech business registries, insolvency databases, and sanction lists to build comprehensive personnel risk profiles. The screening pipeline queries ARES for business involvement, Justice.cz for corporate officer positions, ISIR for insolvency proceedings, and international sanction lists for regulatory compliance flags. Each registry query returns structured results that are normalized and aggregated into a unified screening profile.

**Risk scoring** computes configurable [risk score](/glossary/risk-score/)s based on screening findings, combining multiple risk factors with weighted scoring models. Risk factors include insolvency history (weighted by recency and resolution status), active litigation involvement, sanction list presence, corporate officer positions in high-risk entities, and cross-entity relationship patterns that suggest undisclosed conflicts of interest. Scoring models are configurable per organization to reflect different risk tolerance levels and regulatory requirements.

**GDPR-compliant processing** ensures all personal data processing adheres to data minimization, purpose limitation, and retention policies required by European privacy regulations. The screening specialist collects only data relevant to the screening purpose, processes it within defined retention windows, and provides data subject access capabilities required by GDPR Articles 15-20. Processing activities are logged for GDPR accountability requirements under Article 30.

**Batch screening operations** process large sets of personnel records efficiently during organizational onboarding or periodic re-screening campaigns. Batch processing implements parallel registry queries with rate limiting to respect registry access constraints, progress tracking for long-running batches, and partial result delivery so that completed individual screenings are available before the full batch completes.

**Temporal validity tracking** records when each screening was performed and flags results that have exceeded their validity period for re-screening. Screening results are not permanently valid -- personnel circumstances change, new insolvency proceedings may be filed, and sanction lists are updated regularly. The specialist maintains validity windows for each data source and proactively triggers re-screening when validity periods expire.

**Evidence-grade reporting** produces audit-ready screening reports with full provenance chains linking every finding to its source registry and query timestamp. Reports are formatted to satisfy regulatory audit requirements, including NIS2 compliance evidence and ZKB reporting templates. Each report includes explicit confidence scores for every finding, data source attribution, and temporal validity markers.

## Screening Pipeline Architecture

The screening pipeline processes individual or batch screening requests through a structured workflow.

```
Request Input --> Identity Verification --> Registry Queries --> Result Aggregation
       |                  |                       |                     |
   Name, DOB,        Name matching           ARES, Justice.cz      Normalized
   ID number         DOB verification         ISIR, Sanctions       findings
   Organization      De-duplication           International         Deduplicated
                                              registries

   --> Risk Scoring --> Compliance Check --> Report Generation --> Delivery
          |                  |                    |                   |
     Weighted model      GDPR compliance      PDF/JSON format    Encrypted
     Configurable        NIS2 requirements    Audit-ready         delivery
     thresholds          ZKB reporting        Provenance chain    Retention
```

## Registry Data Sources

The screening specialist queries multiple Czech and international data sources.

| Registry | Content | Relevance |
|----------|---------|-----------|
| ARES | Business registry, trade licenses | Corporate officer positions, business involvement |
| Justice.cz | Commercial register, company filings | Director roles, ownership structures |
| ISIR | Insolvency register | Active or historical insolvency proceedings |
| InfoSoud | Court case records | Litigation involvement |
| CUZK | Land registry | Property ownership for conflict-of-interest screening |
| EU Sanctions | EU consolidated sanction list | Regulatory sanctions compliance |
| OFAC SDN | US sanction list | International sanctions compliance |
| UN Sanctions | UN Security Council sanctions | International sanctions compliance |

## Compliance Framework Alignment

The Employee Screening Specialist's capabilities map directly to regulatory requirements under two primary compliance frameworks.

| Requirement | NIS2 Reference | ZKB Reference | Agent Capability |
|-------------|---------------|---------------|-----------------|
| Personnel vetting | Article 21(2)(i) | Section 17 | Multi-registry screening |
| Risk assessment | Article 21(2)(a) | Section 8 | Configurable risk scoring |
| Audit documentation | Article 21(5) | Section 24 | Evidence-grade reporting |
| Regular review | Article 21(3) | Section 18 | Temporal validity and re-screening |
| Data protection | Article 35 | Section 31 | GDPR-compliant processing |

## Authority Level

**L3** - Strategic Command - Multi-domain coordination and specialized operational command. The Employee Screening Specialist has authority to initiate screening operations, access Czech public registries, and produce compliance reports. Cross-domain coordination with intelligence agents for enhanced screening requires explicit authorization per GDPR purpose limitation requirements.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [cer-compliance-commander](/agents/cer-compliance-commander/) | Command Authority | Receives screening directives and reports results for CER compliance assessment |
| [supplier-vetting-specialist](/agents/supplier-vetting-specialist/) | Screening Partner | Coordinates screening methodology shared between employee and supplier verification |
| [czech-registry-person-investigator](/agents/czech-registry-person-investigator/) | Registry Access | Provides Czech registry query capabilities for person-level investigations |
| [district-court-specialist](/agents/district-court-specialist/) | Legal Data | Provides court record analysis for litigation history screening |

## Integration Architecture

| Component | Relationship | Purpose |
|-----------|-------------|---------|
| Czech Registries | Data source | Public registry queries for screening data |
| Sanction Lists | Data source | International sanction list screening |
| [Prismatic Storage](/glossary/prismatic-storage/) | Evidence persistence | Screening result storage with GDPR compliance |
| [Entity Resolution](/glossary/entity-resolution/) | Identity matching | Cross-registry identity verification |
| Report Synthesis | Output formatting | Compliance-ready report generation |
| [Telemetry](/glossary/telemetry/) | Operational metrics | Screening throughput and accuracy tracking |

## Privacy Safeguards

Employee screening involves personal data processing that requires strict privacy protections.

| Safeguard | Implementation | Regulatory Basis |
|-----------|---------------|-----------------|
| Purpose limitation | Screening data used only for stated purpose | GDPR Art. 5(1)(b) |
| Data minimization | Collect only screening-relevant data | GDPR Art. 5(1)(c) |
| Storage limitation | Automated retention and deletion | GDPR Art. 5(1)(e) |
| Data subject rights | Access, rectification, erasure support | GDPR Art. 15-20 |
| Processing records | Full audit trail of all processing | GDPR Art. 30 |
| Encryption | At-rest and in-transit encryption | GDPR Art. 32 |

## Enforcement

Employee screening operates under [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. No screening report is issued without verified source data from at least two independent registries, per NABLA [Signal Plurality](/glossary/signal-plurality/). Screening results without explicit confidence scores and provenance chains are rejected as incomplete. GDPR violations in screening operations trigger immediate L3 escalation and process halt. Screening reports that exceed their temporal validity are automatically flagged and excluded from compliance evidence until re-screening is completed.

## Related Agents

- [**cer-compliance-commander**](/agents/cer-compliance-commander/) (L3) - CER compliance assessment and directive coordination
- [**supplier-vetting-specialist**](/agents/supplier-vetting-specialist/) (L3) - Supply chain partner verification using shared screening methodology
- [**czech-registry-person-investigator**](/agents/czech-registry-person-investigator/) (L3) - Czech registry person-level investigation capabilities

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)