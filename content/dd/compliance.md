+++
title = "Compliance Framework Integration"
weight = 70
date = "2026-02-17"

[extra]
tags = ["compliance", "nis2", "zkb", "aml", "kyc", "gdpr", "regulatory", "due-diligence"]
icon = "clipboard-check"
color = "teal"
description = "Mapping due diligence findings to NIS2 Directive, ZKB 264/2025, AML/KYC requirements, and GDPR compliance obligations"
category = "compliance"
status = "active"
author = "Tomáš Korcak (korczis)"
reading_time = "14 min"
word_count = 2500
difficulty = "advanced"
image = "/images/dd/compliance.png"
image_alt = "Compliance framework mapping across NIS2, ZKB, AML and GDPR"
og_type = "article"
twitter_card = "summary_large_image"
academic_tier = "whitepaper"
content_version = "1.0.0"
last_enhanced = "2026-02-17"
quality_score = 91
see_also = ["risk-assessment", "methodology", "ma-due-diligence", "czech-registries"]
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Compliance", "Framework", "Integration", "Mapping", "NIS2", "Directive", "2642025", "AMLKYC", "GDPR", "Prismatic Platform"]
+++

## Abstract

The Prismatic Platform's Compliance Framework Integration maps due diligence investigation findings to the specific requirements of four major regulatory frameworks relevant to the Central European market: the [NIS2 Directive](/glossary/nis2/) (EU 2022/2555) for cybersecurity supply chain risk management, the [ZKB 264/2025 Sb.](/glossary/zkb/) Czech cybersecurity implementation, AML/KYC (Anti-Money Laundering / Know Your Customer) directives for financial sector compliance, and GDPR data protection assessments for investigated entities. Rather than producing generic due diligence reports that require manual mapping to regulatory requirements, the platform generates compliance-structured outputs that directly satisfy regulatory obligations, reducing the gap between investigation and compliance demonstration.

## Introduction

### The Compliance-Due Diligence Nexus

Due diligence and regulatory compliance are increasingly intertwined. The NIS2 Directive requires organizations to conduct supply chain risk assessments, including due diligence on critical suppliers. Anti-money laundering regulations mandate customer due diligence (CDD) and enhanced due diligence (EDD) procedures. The Czech ZKB implementation adds national-level requirements for entity verification and cybersecurity assessment. In each case, the substantive investigation is fundamentally the same -- verifying entity identity, assessing risk, and documenting findings -- but the reporting format, terminology, and required evidence differ across frameworks.

The Prismatic Platform addresses this by treating compliance mapping as a presentation layer over the underlying investigation data rather than a separate investigative process. The same entity data, [risk assessments](/dd/risk-assessment/), and [cross-validated findings](/dd/methodology/) are mapped to multiple compliance frameworks simultaneously, ensuring consistency while satisfying the specific requirements of each framework.

### Supported Frameworks

| Framework | Jurisdiction | Primary Application | Platform Coverage |
|-----------|-------------|---------------------|-------------------|
| **NIS2 Directive** | EU (all member states) | Supply chain cybersecurity risk management | Full |
| **ZKB 264/2025 Sb.** | Czech Republic | National cybersecurity entity verification | Full |
| **AMLD / AML-KYC** | EU + national implementations | Financial sector customer verification | Full |
| **GDPR** | EU + EEA | Data protection impact assessments | Partial (entity assessment) |

## NIS2 Directive Compliance (EU 2022/2555)

### Overview

The Network and Information Security Directive 2 (NIS2) is the EU's comprehensive cybersecurity legislation, effective from October 2024. It expands the scope of cybersecurity requirements to cover essential and important entities across 18 sectors, including energy, transport, health, digital infrastructure, ICT service management, public administration, and manufacturing.

Article 21 of NIS2 requires entities to implement risk management measures including "supply chain security, including security-related aspects concerning the relationships between each entity and its direct suppliers or service providers." This directly mandates due diligence on supply chain partners.

### NIS2 Compliance Mapping

The platform maps investigation findings to NIS2 requirements as follows:

| NIS2 Requirement | Article | Platform Component | Evidence Source |
|-----------------|---------|-------------------|----------------|
| Supply chain risk assessment | Art. 21(2)(d) | [Risk Assessment](/dd/risk-assessment/) | All 7 dimensions, especially Cyber and Operational |
| Supplier identity verification | Art. 21(2)(d) | [Entity Management](/dd/entity-management/) | Registry verification, [triple-check](/dd/methodology/) |
| Cybersecurity posture assessment | Art. 21(2)(a) | Cyber risk dimension | [Shodan](/osint/shodan/), [Censys](/osint/censys/), [HIBP](/osint/haveibeenpwned/) |
| Business continuity assessment | Art. 21(2)(c) | Operational risk dimension | Financial data, operational indicators |
| Incident history review | Art. 21(2)(b) | Cyber risk dimension, Legal dimension | Breach databases, regulatory records |
| Governance assessment | Art. 21(2)(a) | Ownership risk dimension | [Graph analysis](/dd/graph-analysis/), registry data |

### NIS2 Report Structure

The platform generates NIS2-compliant assessment reports with the following structure:

1. **Entity Identification**: Verified identity information with triple-check confidence scores
2. **Sector Classification**: NIS2 sector mapping (essential vs. important entity)
3. **Risk Assessment Summary**: Overall risk rating with dimensional breakdown
4. **Cybersecurity Posture**: Technical security assessment from EASM data
5. **Supply Chain Position**: Analysis of the entity's role in the supply chain
6. **Incident History**: Known security incidents and breach history
7. **Governance Assessment**: Ownership transparency and governance quality
8. **Compliance Status**: Known regulatory compliance or violations
9. **Recommended Mitigations**: Suggested contractual and technical mitigations

### NIS2 Scoring Integration

The platform's [security rating](/glossary/security-rating/) system produces A-F grades that directly map to NIS2 supply chain risk categories:

| Platform Grade | NIS2 Risk Category | Required Action |
|---------------|-------------------|----------------|
| A-B | Low Risk | Standard supplier management |
| C | Medium Risk | Enhanced monitoring, contractual security requirements |
| D | High Risk | Risk mitigation plan required, consider alternatives |
| E-F | Critical Risk | Do not engage without significant remediation |

## ZKB 264/2025 Sb. Compliance (Czech Implementation)

### Overview

Zakon o kyberneticke bezpecnosti (ZKB) 264/2025 Sb. is the Czech Republic's national cybersecurity law implementing EU cybersecurity frameworks. It establishes national requirements for critical infrastructure protection, entity verification, incident reporting, and cybersecurity assessment that extend beyond the EU baseline in several areas.

### ZKB-Specific Requirements

The ZKB adds Czech-specific requirements that the platform addresses through its deep [Czech registry integration](/dd/czech-registries/):

| ZKB Requirement | Section | Platform Component |
|-----------------|---------|-------------------|
| Entity verification through Czech registries | Sec. 4 | [ARES](/osint/ares/), [Justice.cz](/osint/justice-cz/) verification |
| Beneficial ownership disclosure | Sec. 7 | [Graph analysis](/dd/graph-analysis/) UBO determination |
| Critical infrastructure supplier assessment | Sec. 12 | Full risk assessment (7 dimensions) |
| Czech-language reporting | Sec. 15 | Localized report generation |
| NUKIB notification readiness | Sec. 18 | Incident history and response capability assessment |
| Data localization verification | Sec. 21 | Infrastructure analysis, hosting verification |

### Cross-Registry Verification for ZKB

ZKB compliance benefits from the platform's ability to verify entity identity across multiple Czech registries simultaneously. A ZKB-compliant entity verification includes:

1. **ICO verification** through [ARES](/osint/ares/) with cross-check against [Justice.cz](/osint/justice-cz/)
2. **Trade license verification** through [RZP](/osint/rzp/) confirming authorized business activities
3. **Insolvency screening** through [ISIR](/osint/insolvencni-rejstrik/) confirming financial stability
4. **VAT compliance check** through DPH registry (nespolehlivy platce screening)
5. **Sanctions screening** against EU Consolidated, OFAC SDN, and UN Security Council lists
6. **Beneficial ownership determination** through [graph analysis](/dd/graph-analysis/) of ownership chains

This multi-registry verification satisfies ZKB's entity verification requirements with evidence-grade confidence through the [triple-check methodology](/dd/methodology/).

## AML/KYC Compliance

### Customer Due Diligence (CDD)

The EU's Anti-Money Laundering Directives (currently 6AMLD, with AMLR entering force) require financial institutions and designated non-financial businesses to perform customer due diligence before establishing business relationships. The Prismatic Platform's DD capability directly supports CDD by providing:

| CDD Requirement | AMLD Article | Platform Component |
|----------------|-------------|-------------------|
| Customer identification | Art. 13(1)(a) | Entity verification through [registries](/dd/czech-registries/) |
| Beneficial ownership identification | Art. 13(1)(b) | [Graph analysis](/dd/graph-analysis/) UBO determination |
| Purpose of business relationship | Art. 13(1)(c) | NACE code analysis, contract history |
| Ongoing monitoring | Art. 13(1)(d) | Continuous monitoring capability |
| PEP screening | Art. 20-23 | Automated PEP database screening |
| Sanctions screening | Art. 14 | OFAC, EU, UN sanctions list screening |

### Enhanced Due Diligence (EDD)

For high-risk scenarios (cross-border correspondent relationships, PEP connections, high-risk third countries), the platform supports enhanced due diligence with:

- **Deeper ownership analysis**: Extended graph traversal beyond the standard 4-hop limit to 8+ hops for complex structures
- **Source of wealth analysis**: Combining financial data, contract history, and subsidy data to assess wealth origins
- **Geographic risk assessment**: Mapping entity connections to FATF grey/black-listed jurisdictions
- **Transaction pattern analysis**: Where available, analysis of financial transaction patterns for unusual activity
- **Senior management approval**: Workflow integration requiring senior reviewer approval for EDD conclusions

### Suspicious Activity Indicators

The platform automatically flags findings that may constitute suspicious activity indicators under AML frameworks:

| Indicator Category | Examples | Platform Detection Method |
|-------------------|----------|--------------------------|
| **Ownership Opacity** | Unable to identify UBO; nominee structures | Graph analysis, ownership chain gaps |
| **Jurisdictional Risk** | Connections to high-risk jurisdictions | Jurisdictional analysis of ownership chain |
| **Unusual Structures** | Circular ownership, orphan entities | Graph anomaly detection |
| **Financial Indicators** | Insolvency followed by new entity creation | Temporal analysis, entity linking |
| **Sanctions Proximity** | Close network connections to sanctioned parties | Graph shortest-path analysis |
| **Rapid Restructuring** | Frequent ownership/director changes | Change velocity analysis |

## GDPR Data Protection Assessment

### Entity-Level GDPR Assessment

While the platform's primary focus is entity due diligence rather than data protection auditing, the compliance framework includes a GDPR assessment component that evaluates an entity's data protection posture based on publicly available information:

| Assessment Area | Data Sources | Risk Indicators |
|----------------|-------------|-----------------|
| **Breach history** | [HIBP](/osint/haveibeenpwned/), breach databases | Known data breaches involving the entity |
| **Cookie/tracking compliance** | Website analysis | Non-compliant cookie banners, tracking without consent |
| **Privacy policy** | Website analysis | Missing or non-compliant privacy policy |
| **Data protection officer** | Registry data, website | DPO appointment for entities requiring one |
| **Cross-border transfers** | Infrastructure analysis | Data processing in non-adequate jurisdictions |

This assessment is particularly relevant for [M&A due diligence](/dd/ma-due-diligence/), where GDPR non-compliance in a target entity can represent significant post-acquisition liability.

## Compliance Report Generation

### Multi-Framework Reports

The platform's [case management system](/dd/case-management/) generates compliance-mapped reports that simultaneously address multiple regulatory frameworks. A single investigation can produce:

- **NIS2 Supply Chain Assessment Report**: Structured for submission to national cybersecurity authorities
- **ZKB Entity Verification Report**: Formatted per Czech regulatory requirements with Czech-language support
- **CDD/EDD Report**: Formatted for financial institution AML compliance files
- **GDPR Data Protection Assessment**: For inclusion in M&A data room documentation

Each report draws from the same underlying investigation data but presents findings in the framework-specific structure, terminology, and evidence format required by the respective regulation.

### Evidence Packaging

Compliance reports include evidence packages that bundle:

- Source data snapshots with timestamps and provenance
- Cross-validation results showing multi-source corroboration
- Graph analysis outputs with ownership chain visualizations
- Risk assessment dimension breakdowns with indicator-level detail
- Analyst notes and review documentation

This evidence packaging enables regulators, auditors, and legal counsel to independently verify the investigation's findings and conclusions.

## Regulatory Change Management

### Framework Updates

The compliance mapping layer is designed for adaptability as regulatory frameworks evolve. When regulations are amended (e.g., new NIS2 implementing acts, ZKB amendments, AMLR entering force), the mapping templates are updated without requiring changes to the underlying investigation methodology. This separation of investigation logic from compliance presentation ensures that the platform can rapidly adapt to regulatory changes.

### Jurisdiction Expansion

The framework architecture supports adding new jurisdictions and regulatory frameworks. The mapping engine is parameterized by jurisdiction, enabling:

- **Slovak registry integration**: Similar registry infrastructure to Czech Republic
- **DORA compliance**: Digital Operational Resilience Act for financial entities
- **MiCA compliance**: Markets in Crypto-Assets regulation
- **National AML implementations**: Country-specific AML requirements beyond the EU baseline

## Conclusion

The Compliance Framework Integration transforms due diligence investigation outputs into regulation-ready compliance documentation, eliminating the manual mapping effort that traditionally separates investigation from compliance demonstration. By supporting NIS2, ZKB, AML/KYC, and GDPR frameworks simultaneously from a single investigation, the platform enables organizations to satisfy multiple regulatory obligations efficiently while maintaining the evidentiary rigor that regulators require.

## References

- [NIS2 Directive](/glossary/nis2/)
- [ZKB Czech Cybersecurity Law](/glossary/zkb/)
- [Risk Assessment Framework](/dd/risk-assessment/)
- [Triple-Check Methodology](/dd/methodology/)
- [Czech Registry Integration](/dd/czech-registries/)
- [Graph Analysis Engine](/dd/graph-analysis/)
- [Case Management System](/dd/case-management/)
- [M&A Due Diligence](/dd/ma-due-diligence/)
- [Compliance Capability](/capabilities/compliance/)
- [Sanctions Screening](/glossary/sanctions-screening/)

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
