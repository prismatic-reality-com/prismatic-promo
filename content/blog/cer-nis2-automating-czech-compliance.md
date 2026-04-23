+++
title = "CER/NIS2 Compliance: Automating Czech Critical Entity Requirements"
date = 2026-03-19
description = "How Prismatic automates NIS2 and Czech ZKB compliance for critical entities: supplier vetting, employee screening, incident reporting, and evidence-based gap analysis."

[extra]
author = "Tomas Korcak (korczis)"
category = "product"
tags = ["compliance", "nis2", "cer", "czech", "regulation", "security"]
reading_time = "8 min"
keywords = ["NIS2 compliance tool", "Czech CER compliance", "ZKB cybersecurity regulation", "critical entity requirements", "automated compliance", "supplier vetting"]
image = "/images/blog/cer-nis2-compliance.png"
word_count = 1500
date_created = "2026-03-19"
date_modified = "2026-03-19"
quality_score = 85
see_also = ["nis2", "compliance", "zkb", "risk-assessment", "evidence"]
image_alt = "CER/NIS2 Compliance: Automating Czech Critical Entity Requirements - Prismatic Platform"
+++

The EU NIS2 Directive (2022/2555) and Czech ZKB 264/2025 Sb. impose cybersecurity obligations on essential and important entities. These are not suggestions -- they carry significant penalties for non-compliance. This post describes how Prismatic automates the compliance workflow.

## The Regulatory Landscape

**NIS2** (Network and Information Security Directive 2) is the EU-wide framework. It requires:

- Cybersecurity risk management measures (Article 21)
- Incident reporting within 24/72 hours (Article 23)
- Supply chain security assessment (Article 24)
- Management body accountability (Article 20)

**ZKB** (Zakon o kyberneticke bezpecnosti -- Czech Cybersecurity Act) is the national implementation. It adds:

- Critical information infrastructure classification
- Mandatory security audits for designated entities
- Czech-specific incident reporting channels (NUKIB)
- Supplier vetting requirements for critical suppliers

## Automated Compliance Workflow

Prismatic's compliance module operates in four phases:

### Phase 1: Scope Assessment

Before you can comply, you need to know which obligations apply:

```elixir
PrismaticCompliance.assess_scope(%{
  sector: :energy,
  employee_count: 250,
  annual_turnover_eur: 50_000_000,
  jurisdiction: :czech_republic
})
# => %{classification: :essential, applicable_articles: [20, 21, 23, 24]}
```

The assessment considers sector, size, turnover, and jurisdiction to determine whether the entity is "essential" or "important" under NIS2, and which specific obligations apply.

### Phase 2: Supplier Vetting

Article 24 requires supply chain security. Prismatic automates supplier assessment:

- **Business registry verification** -- ICO lookup against ARES, Justice, Insolvency
- **Sanctions screening** -- EU, US OFAC, UK HMT sanctions lists
- **Security posture** -- EASM scan of supplier's internet-facing assets
- **Financial health** -- Credit ratings and insolvency history
- **Beneficial ownership** -- UBO verification where available

Each supplier receives a risk score and a gap report:

```elixir
PrismaticCompliance.vet_supplier("12345678")
# => %{
#   risk_score: :medium,
#   findings: [
#     %{category: :tls, severity: :high, detail: "TLS 1.0 still enabled"},
#     %{category: :dns, severity: :low, detail: "Missing DNSSEC"}
#   ],
#   recommendation: :conditional_approve
# }
```

### Phase 3: Employee Screening

CER requires background checks for personnel with access to critical infrastructure:

- **Identity verification** -- cross-reference against official registries
- **Criminal record** -- where legally permitted and available
- **Sanctions check** -- screening against all applicable sanctions lists
- **Conflict of interest** -- checking for relationships with competitors or adversaries

### Phase 4: Continuous Monitoring

Compliance is not a point-in-time assessment. Prismatic monitors continuously:

- **Supplier risk changes** -- alerts when a supplier's security posture degrades
- **Regulatory updates** -- tracking changes to NIS2 implementing acts
- **Incident detection** -- monitoring for events that trigger reporting obligations
- **Evidence collection** -- maintaining audit trail for regulatory inspections

## Gap Analysis

The compliance dashboard presents a gap analysis mapped to specific regulatory articles:

| Article | Requirement | Status | Evidence |
|---------|-------------|--------|----------|
| Art. 21(a) | Risk analysis policies | Partial | Policy exists, needs review |
| Art. 21(b) | Incident handling | Complete | Playbook + SLA documented |
| Art. 21(d) | Supply chain security | In Progress | 12/18 suppliers vetted |
| Art. 21(e) | Network security | Complete | Perimeter scan Grade B |
| Art. 23 | Incident reporting | Complete | NUKIB integration active |

Each gap includes remediation guidance with effort estimates and priority ranking.

## Incident Reporting

NIS2 requires incident reporting within strict timelines:

- **24 hours** -- early warning to CSIRT
- **72 hours** -- incident notification with initial assessment
- **1 month** -- final report with root cause analysis

Prismatic pre-generates report templates based on incident type and jurisdiction, pre-filling known data from the platform's monitoring systems.

## Evidence-Based Compliance

Every compliance assertion in Prismatic is evidence-backed:

- Security posture claims link to specific EASM scan results
- Supplier vetting claims link to registry lookup timestamps
- Policy claims link to document management records
- Training claims link to academy completion records

This follows the NCLB (No Claim Left Behind) doctrine: no compliance claim exists without verifiable evidence.

## Getting Started

Assess your NIS2 compliance posture:

```bash
# Quick scope assessment
curl -X POST https://api.prismatic-reality.com/v1/compliance/assess \
  -H "Content-Type: application/json" \
  -d '{"sector": "energy", "jurisdiction": "CZ", "employees": 250}'
```

Or use the compliance dashboard at `/capabilities/compliance/` for interactive gap analysis.

---

*Learn more at [Compliance Capabilities](@/capabilities/compliance.md) or explore [Security Ratings](@/blog/security-ratings-easm-explained.md) for the EASM methodology.*
