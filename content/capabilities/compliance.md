+++
title = "Compliance & Regulatory"
weight = 15
[extra]
icon = "scale"
color = "emerald"
description = "Automated regulatory compliance assessment for NIS2, GDPR, and ZKB frameworks with audit trails, policy enforcement, and continuous monitoring"
category = "compliance"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1273
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Compliance", "Regulatory", "Automated", "NIS2", "GDPR", "capabilities", "Prismatic Platform", "EASM"]
tags = ["capabilities", "compliance", "compliance--regulatory", "prismatic"]
quality_score = 75
see_also = ["glossary", "agents", "architecture"]
image = "/images/sections/capabilities.png"
image_alt = "Compliance & Regulatory - Prismatic Platform"
+++

## Overview

Compliance & Regulatory is the Prismatic Platform's capability for automated assessment, continuous monitoring, and evidence-based reporting of compliance posture against regulatory frameworks. The platform currently supports three primary frameworks -- NIS2 (EU Network and Information Security Directive 2), GDPR (General Data Protection Regulation), and ZKB (Czech Cybersecurity Decree 264/2025 Sb.) -- with an extensible architecture designed to accommodate additional regulatory regimes as they emerge. Every compliance finding is backed by verifiable evidence, carries confidence scores, and maintains a complete audit trail from assessment to remediation.

Regulatory compliance is not a checkbox exercise. Organizations that treat it as one inevitably discover gaps when regulators, auditors, or adversaries test their actual posture. The Prismatic approach applies the same epistemic rigor to compliance that governs all platform intelligence products: multi-source evidence gathering, contradiction preservation, confidence scoring, and formal verification through [Trinity Gate](/capabilities/trinity-gate/). The result is a compliance posture that is not merely claimed but demonstrably proved.

## Regulatory Frameworks

### NIS2 Directive (EU 2022/2555)

The Network and Information Security Directive 2 is the European Union's updated cybersecurity framework, significantly expanding the scope and enforcement mechanisms of the original NIS Directive. It applies to essential and important entities across 18 sectors, including energy, transport, banking, financial market infrastructure, health, drinking water, wastewater, digital infrastructure, ICT service management, public administration, and space.

| NIS2 Chapter | Platform Coverage | Assessment Method |
|-------------|------------------|-------------------|
| **Art. 20: Governance** | Management body responsibilities, cybersecurity training | Policy document analysis, training record verification |
| **Art. 21: Cybersecurity Risk Management** | 10 minimum measures across risk analysis, incident handling, supply chain, encryption, access control | Technical control validation via EASM + policy evidence |
| **Art. 23: Reporting Obligations** | 24h early warning, 72h incident notification, 1-month final report | Incident response capability assessment |
| **Art. 24: European Vulnerability Database** | Coordinated vulnerability disclosure | CVE feed integration, disclosure process verification |
| **Art. 28: Registration** | Entity registration with competent authority | Registry status verification |
| **Art. 32-33: Supervision & Enforcement** | Supervisory measures, administrative fines | Historical enforcement action monitoring |

#### NIS2 Article 21 Deep Assessment

Article 21 mandates specific cybersecurity risk management measures. The platform maps each requirement to testable controls:

| Art. 21 Measure | Control Assessment | Evidence Source |
|----------------|-------------------|----------------|
| **(a) Risk analysis & IS policies** | Policy existence, scope coverage, update cadence | Document analysis, management attestation |
| **(b) Incident handling** | Detection capability, response procedures, CSIRT integration | Tabletop exercise records, SIEM configuration |
| **(c) Business continuity** | BCP existence, backup testing, disaster recovery | Recovery test results, RTO/RPO documentation |
| **(d) Supply chain security** | Vendor assessment, third-party risk monitoring | Vendor inventory, SLA analysis, EASM third-party scan |
| **(e) Network & IS security** | Acquisition, development, and maintenance security | SDLC documentation, vulnerability management |
| **(f) Effectiveness assessment** | Cybersecurity policy and measure effectiveness testing | Audit reports, penetration test results |
| **(g) Cybersecurity hygiene & training** | Basic cyber hygiene, employee training programs | Training completion records, phishing test results |
| **(h) Cryptography** | Encryption policies, key management procedures | TLS configuration via EASM, certificate inventory |
| **(i) Human resources & access control** | Access management, asset management | Identity provider configuration, RBAC evidence |
| **(j) Multi-factor authentication** | MFA and secure communication deployment | Authentication endpoint assessment via EASM |

### GDPR (Regulation EU 2016/679)

The General Data Protection Regulation governs the processing of personal data within the EU and EEA. The platform assesses organizational and technical measures required for GDPR compliance:

| GDPR Area | Platform Assessment | Automated Checks |
|-----------|-------------------|------------------|
| **Data Processing Inventory** | Records of processing activities (Art. 30) | Data flow mapping, processor registry verification |
| **Lawful Basis** | Legal basis documentation for processing activities | Consent mechanism review, legitimate interest assessment |
| **Data Subject Rights** | Mechanisms for access, rectification, erasure, portability | Endpoint availability, response time monitoring |
| **Data Protection by Design** | Privacy-by-design implementation evidence | Architecture review, default settings assessment |
| **Data Breach Notification** | 72-hour notification capability and procedures | Incident response process verification |
| **DPO Designation** | Data Protection Officer appointment and registration | Registry verification, contact accessibility |
| **International Transfers** | Adequate safeguards for cross-border data transfers | Transfer mechanism documentation, adequacy decisions |
| **DPIA** | Data Protection Impact Assessment process | DPIA template existence, completion tracking |

### ZKB 264/2025 Sb. (Czech Cybersecurity Decree)

The Czech cybersecurity decree (Zakon o kyberneticke bezpecnosti) implements national cybersecurity obligations for operators of essential services and digital service providers within the Czech Republic. The platform provides native support for ZKB assessment through its deep integration with Czech registries:

| ZKB Section | Requirement | Assessment Method |
|------------|------------|-------------------|
| **Asset Management** | Complete asset inventory with classification | EASM asset discovery + internal inventory correlation |
| **Risk Management** | Risk assessment methodology and regular execution | Risk framework documentation, assessment frequency |
| **Access Control** | Role-based access, principle of least privilege | Authentication endpoint assessment, RBAC evidence |
| **Network Security** | Network segmentation, perimeter protection | Port scan results, firewall configuration evidence |
| **Cryptographic Controls** | Encryption standards, key management | TLS assessment via EASM, certificate management |
| **Security Monitoring** | Continuous monitoring and log management | SIEM evidence, log retention verification |
| **Incident Management** | Detection, response, recovery procedures | Incident response plan, CSIRT coordination |
| **Security Auditing** | Regular security audits and testing | Audit schedule, penetration test reports |
| **Physical Security** | Physical access controls for critical infrastructure | Physical security policy documentation |
| **Personnel Security** | Background checks, security awareness | Training records, clearance documentation |

## Automated Assessment Engine

### Assessment Pipeline

```
Regulatory Framework --> Control Mapping --> Evidence Collection --> Gap Analysis --> Scoring --> Report
       |                      |                     |                    |              |           |
    NIS2/GDPR/ZKB       Framework-specific      EASM findings       Control vs.    Weighted    Structured
    rule definitions     control catalogue       Policy documents    evidence gaps   composite   audit-ready
                                                 Registry data                      per-article  document
                                                 Technical scans
```

### Evidence Collection Architecture

The compliance assessment engine collects evidence from multiple platform capabilities and external sources:

| Evidence Source | Data Collected | Framework Applicability |
|----------------|---------------|------------------------|
| **[EASM](/capabilities/easm/)** | External attack surface findings, security ratings | NIS2 Art. 21, ZKB Network Security |
| **Czech Registries** | Registration status, entity classification | ZKB scope determination, NIS2 Art. 28 |
| **Certificate Monitoring** | TLS configuration, certificate validity | NIS2 Art. 21(h), ZKB Cryptographic Controls |
| **DNS Assessment** | SPF/DKIM/DMARC/DNSSEC configuration | NIS2 Art. 21(e), ZKB Network Security |
| **Policy Documents** | Uploaded organizational policies and procedures | All frameworks -- governance and process evidence |
| **Audit Reports** | Historical audit findings and remediation tracking | All frameworks -- effectiveness assessment |

### Gap Analysis

Gap analysis compares the evidence collected against each regulatory requirement to produce a structured compliance gap report:

```elixir
# Compliance gap analysis
{:ok, gaps} = PrismaticCompliance.analyze_gaps("target-entity.com", :nis2)
# => %{
#   framework: :nis2,
#   total_controls: 42,
#   compliant: 31,
#   partially_compliant: 7,
#   non_compliant: 4,
#   compliance_score: 82,
#   critical_gaps: [
#     %{
#       article: "21(2)(d)",
#       control: "Supply chain security",
#       status: :non_compliant,
#       finding: "No documented supply chain risk assessment process",
#       remediation: "Implement vendor assessment framework with risk scoring",
#       confidence: 0.91
#     }
#   ],
#   improvement_priority: [
#     %{article: "21(2)(d)", impact: :high, effort: :medium},
#     %{article: "21(2)(f)", impact: :medium, effort: :low}
#   ]
# }
```

## Audit Trails

### Immutable Evidence Chain

Every compliance assessment produces an immutable audit trail that satisfies regulatory evidence requirements:

| Audit Record | Contents | Retention |
|-------------|----------|-----------|
| **Assessment Record** | Timestamp, assessor, framework, scope, methodology | 5 years (NIS2), 6 years (GDPR) |
| **Evidence Artifacts** | Raw data collected, source identification, collection timestamp | Duration of assessment validity |
| **Finding Records** | Control assessment result, evidence reference, confidence score | Duration of assessment validity |
| **Remediation Tracking** | Gap identified, remediation plan, completion date, verification | Until next assessment cycle |
| **Change History** | All modifications to compliance posture with before/after state | Permanent |

### Provenance Compliance

Following the [Provenance Mandatory](/glossary/provenance-mandatory/) NABLA axiom, every compliance finding is traceable to its original evidence:

```
Finding: "TLS 1.0 still enabled on subdomain X"
  |
  +-- Evidence: EASM scan result (scan_id: ABC123, timestamp: 2026-02-14T10:30:00Z)
  |     +-- Raw data: TLS handshake response showing TLS 1.0 support
  |     +-- Tool: OpenSSL probe via Prismatic Perimeter scanner
  |
  +-- Control mapping: NIS2 Art. 21(2)(h) -- Cryptography
  |     +-- Requirement: "Use of encryption and, where applicable, up-to-date encryption"
  |
  +-- Risk assessment: HIGH (deprecated protocol, known vulnerabilities)
  |     +-- CVE references: CVE-2014-3566 (POODLE), CVE-2011-3389 (BEAST)
  |
  +-- Remediation: Disable TLS 1.0/1.1, enforce TLS 1.2+ minimum
        +-- Estimated effort: LOW
        +-- Verification: Re-scan after remediation
```

## Policy Enforcement

### Continuous Compliance Monitoring

Compliance is not assessed once and forgotten. The platform provides continuous monitoring that detects compliance drift:

| Monitoring Type | Frequency | Trigger |
|----------------|-----------|---------|
| **Configuration Drift** | Continuous | EASM detects change in external posture |
| **Certificate Expiry** | Daily | Approaching expiry thresholds (30/14/7/1 days) |
| **Regulatory Updates** | Weekly | New amendments, guidance, or interpretive decisions |
| **Remediation Deadlines** | Daily | Approaching deadlines for gap remediation |
| **Re-assessment** | Quarterly | Scheduled full compliance re-assessment |

### Automated Policy Rules

```elixir
# Define compliance policy rules
policy = %CompliancePolicy{
  framework: :nis2,
  rules: [
    %Rule{
      control: "encryption",
      condition: fn finding -> finding.tls_version >= "1.2" end,
      severity: :critical,
      auto_alert: true
    },
    %Rule{
      control: "mfa",
      condition: fn finding -> finding.mfa_enabled == true end,
      severity: :high,
      auto_alert: true
    }
  ],
  alerting: %{
    channels: [:email, :slack, :dashboard],
    escalation: :compliance_officer
  }
}
```

## Reporting

### Regulatory Report Generation

The platform generates audit-ready compliance reports formatted for regulatory submission:

| Report Type | Audience | Format | Content |
|------------|---------|--------|---------|
| **Executive Summary** | Board, C-suite | PDF, dashboard | Overall posture, critical gaps, trend |
| **Detailed Assessment** | CISO, compliance team | PDF, structured data | Full control-by-control assessment |
| **Auditor Package** | External auditors | Structured archive | Evidence artifacts, methodology, findings |
| **Regulatory Submission** | Competent authority | Framework-specific format | NIS2/ZKB mandated reporting format |
| **Remediation Plan** | Operations teams | Actionable document | Prioritized gap list, remediation steps, deadlines |

### Compliance Dashboard

The LiveView-based compliance dashboard provides real-time visibility into compliance posture:

```
/perimeter/compliance    -- Full compliance assessment with framework drill-down
/perimeter/compliance/nis2  -- NIS2-specific assessment detail
/perimeter/compliance/gdpr  -- GDPR assessment and data processing inventory
/perimeter/compliance/zkb   -- ZKB assessment with Czech registry integration
```

## Integration

- Powered by [External Attack Surface Management](/capabilities/easm/) for technical evidence collection
- All findings verified through [Trinity Gate](/capabilities/trinity-gate/) 4-layer validation
- Governed by [NABLA Axioms](/capabilities/nabla-axioms/) for evidence-based compliance assessment
- Enforces [NO DOUBTS](/capabilities/no-doubts/) -- every compliance claim backed by traceable evidence
- Quality enforced by [NO MERCY](/capabilities/no-mercy/) zero-tolerance standards
- Intelligence from [Intelligence Synthesis](/capabilities/intelligence-synthesis/) feeds regulatory risk assessment
- Monitored through [Real-Time Monitoring](/capabilities/real-time-monitoring/) for compliance drift detection
- Agent operations tracked via [Telemetry Integration](/capabilities/telemetry-integration/)
- Supports [M&A Intelligence](/capabilities/ma-intelligence/) with compliance risk domain data
- Automated through [AIAD Standard](/capabilities/aiad-standard/) agent orchestration

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)