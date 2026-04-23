+++
title = "Risk Assessment Framework"
weight = 60
date = "2026-02-17"

[extra]
tags = ["risk-assessment", "risk-scoring", "seven-dimensions", "security-rating", "due-diligence", "compliance"]
icon = "exclamation-triangle"
color = "orange"
description = "7-dimensional risk scoring framework with A-F letter grades and 300-900 numeric scores for comprehensive entity risk evaluation"
category = "analysis"
status = "active"
author = "Tomáš Korcak (korczis)"
reading_time = "14 min"
word_count = 2600
difficulty = "advanced"
image = "/images/dd/risk-assessment.png"
image_alt = "Seven-dimensional risk assessment scoring framework"
og_type = "article"
twitter_card = "summary_large_image"
academic_tier = "whitepaper"
content_version = "1.0.0"
last_enhanced = "2026-02-17"
quality_score = 93
see_also = ["methodology", "graph-analysis", "compliance", "ma-due-diligence"]
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Risk", "Assessment", "Framework", "7-dimensional", "300-900", "analysis", "Prismatic Platform", "Weight", "Assessment Criteria", "Indicator"]
+++

## Abstract

The Risk Assessment Framework translates raw investigative findings from the Prismatic Platform's due diligence pipeline into structured, quantifiable risk evaluations using a seven-dimensional scoring model. Each dimension -- Financial, Legal, Ownership, Operational, Compliance, Reputational, and Cyber -- produces a normalized score from 0 (minimal risk) to 100 (critical risk), weighted and combined into an overall risk rating expressed as both a letter grade (A through F) and a numeric score on a 300-900 scale. This scoring methodology is comparable to industry standards from SecurityScorecard and BitSight, enabling direct comparison with existing risk management workflows while providing deeper analytical granularity through its multi-dimensional decomposition and evidence-based scoring approach.

## Introduction

### From Data to Decision

Due diligence investigations collect vast quantities of data from [122 OSINT sources](/dd/osint-integration/), [30+ Czech registries](/dd/czech-registries/), and [graph analysis](/dd/graph-analysis/) traversals. Without a systematic framework for translating this data into actionable risk assessments, decision-makers are confronted with information overload rather than intelligence. The Risk Assessment Framework bridges the gap between evidence collection and decision support by providing a structured, reproducible, and auditable methodology for computing risk scores that directly inform M&A go/no-go decisions, compliance determinations, and counterparty acceptance.

### Design Goals

The framework pursues four design goals:

1. **Multi-dimensional**: Risk is inherently multi-faceted. A company may have excellent financial health but critical ownership opacity. The seven-dimension model ensures that no significant risk category is overlooked.
2. **Evidence-based**: Every risk score is computed from verified data points, not subjective assessments. Each score carries a confidence level reflecting the quality and quantity of underlying evidence.
3. **Comparable**: The 300-900 numeric scale and A-F letter grades enable comparison across entities, investigations, and time periods, as well as compatibility with third-party risk rating services.
4. **Auditable**: The scoring methodology is transparent and deterministic. Given the same input data, the framework produces the same risk scores, and the derivation of each score can be traced to specific findings.

## The Seven Risk Dimensions

### Financial Risk (Weight: 20%)

Financial risk assessment evaluates the target entity's financial health, stability, and integrity through analysis of available financial indicators.

**Assessment Criteria**:

| Indicator | Source | Scoring Impact |
|-----------|--------|---------------|
| Insolvency proceedings | [ISIR](/osint/insolvencni-rejstrik/) | Active insolvency: +80; Historical: +30 |
| Tax arrears | DPH unreliable payer flag | Flagged: +60; Clean: 0 |
| Registered capital adequacy | [Justice.cz](/osint/justice-cz/) | Below industry norm: +20-40 |
| Subsidy dependency | [CEDR](/osint/cedr/), [SZIF](/osint/szif/) | >50% revenue from subsidies: +30 |
| Public contract concentration | [Registr Smluv](/osint/registr-smluv/) | >70% revenue from single client: +25 |
| Enforcement proceedings | Czech court records | Active: +40; Historical: +15 |
| Financial statement filing | Justice.cz | Missing filings: +20 per year |

The financial dimension draws primarily from Czech registry data, making it one of the most robust dimensions for entities registered in the Czech Republic. For international entities, the platform supplements with data from [OpenCorporates](/osint/open-corporates/), [SEC EDGAR](/osint/sec-edgar/), and credit reporting services.

### Legal Risk (Weight: 20%)

Legal risk captures exposure to litigation, regulatory action, sanctions, and other legal proceedings that may materially affect the entity.

**Assessment Criteria**:

| Indicator | Source | Scoring Impact |
|-----------|--------|---------------|
| Active court proceedings | Czech courts, [Hlidac Statu](/osint/hlidac-statu/) | Material proceedings: +30-60 |
| Sanctions matches | [OFAC](/osint/ofac/), [EU Sanctions](/osint/eu-sanctions/), [UN Sanctions](/osint/un-sanctions/) | Direct match: +100; Proximity: +40-70 |
| PEP connections | PEP screening databases | Direct PEP: +50; PEP associate: +25 |
| Regulatory actions | Sector regulators ([UOHS](/osint/uohs/), [ERU](/osint/eru/), [SUKL](/osint/sukl/)) | Enforcement action: +40; Warning: +15 |
| Historical legal issues | Court archives | Pattern of litigation: +20-40 |
| License status | [RZP](/osint/rzp/), sector regulators | Suspended/revoked: +60; Expired: +30 |

Sanctions screening is performed against all three major sanctions lists (OFAC SDN, EU Consolidated, UN Security Council) plus national PEP databases. A direct sanctions match on the target entity or any of its beneficial owners immediately elevates the overall risk rating to F regardless of other dimension scores.

### Ownership Risk (Weight: 15%)

Ownership risk evaluates the transparency and governance quality of the entity's ownership structure, drawing heavily from [graph analysis](/dd/graph-analysis/) results.

**Assessment Criteria**:

| Indicator | Source | Scoring Impact |
|-----------|--------|---------------|
| Beneficial ownership opacity | [Graph analysis](/dd/graph-analysis/) | Unknown UBO: +70; Partial disclosure: +30 |
| Nominee structures | Director network analysis | Detected nominee pattern: +50 |
| Circular ownership | Graph cycle detection | Detected: +60 |
| Offshore holding layers | Jurisdictional analysis | 3+ offshore layers: +40 |
| Frequent ownership changes | Temporal analysis | >2 changes/year: +30 |
| Shell company indicators | Address clustering | Mass registration address: +40 |
| PEP as UBO | PEP screening + ownership chain | PEP beneficial owner: +50 |

The ownership dimension leverages the platform's [graph analysis engine](/dd/graph-analysis/) extensively. Multi-layered holding structures through opacity jurisdictions, combined with high change velocity, produce the highest ownership risk scores.

### Operational Risk (Weight: 15%)

Operational risk assesses the entity's ability to sustain business operations and honor contractual commitments.

**Assessment Criteria**:

| Indicator | Source | Scoring Impact |
|-----------|--------|---------------|
| Key person dependency | Director network analysis | Single director for 5+ entities: +30 |
| Business continuity | NACE codes, employee data | Single product/service: +20 |
| Supply chain concentration | Contract analysis | >60% from single supplier: +25 |
| Age and track record | Formation date | <2 years: +20; >10 years: -10 |
| Employee base | Statistical registry (RES) | 0 employees registered: +30 |
| Virtual office registration | Address analysis, [CUZK](/osint/cuzk/) | Virtual office: +15 |

### Compliance Risk (Weight: 10%)

Compliance risk measures adherence to applicable regulatory frameworks and the entity's compliance posture.

**Assessment Criteria**:

| Indicator | Source | Scoring Impact |
|-----------|--------|---------------|
| Regulatory compliance history | Sector regulators | Violations: +20-50 |
| License currency | [RZP](/osint/rzp/), sector registries | All current: 0; Gaps: +30 |
| Filing compliance | Justice.cz, Tax administration | Missing filings: +20 per item |
| Data protection | GDPR assessments | Known violations: +30 |
| Industry-specific requirements | Sector databases | Non-compliance: +25-50 |

### Reputational Risk (Weight: 10%)

Reputational risk evaluates the entity's public perception and association with controversial activities or entities.

**Assessment Criteria**:

| Indicator | Source | Scoring Impact |
|-----------|--------|---------------|
| Negative media coverage | News APIs, [Hlidac Statu](/osint/hlidac-statu/) | Significant controversy: +30-50 |
| Social media sentiment | Social monitoring | Persistent negative sentiment: +20 |
| Industry reputation | Trade associations, ratings | Poor standing: +25 |
| Association with controversial entities | [Graph analysis](/dd/graph-analysis/) | Direct association: +30 |
| ESG concerns | ESG databases | Material concerns: +20-40 |

### Cyber Risk (Weight: 10%)

Cyber risk assesses the entity's digital security posture and exposure to cyber threats.

**Assessment Criteria**:

| Indicator | Source | Scoring Impact |
|-----------|--------|---------------|
| Data breach history | [HIBP](/osint/haveibeenpwned/) | Recent breach: +40; Historical: +15 |
| Domain security | [SecurityTrails](/osint/securitytrails/), [crt.sh](/osint/crtsh/) | Missing HTTPS: +20; Expired cert: +30 |
| Infrastructure exposure | [Shodan](/osint/shodan/), [Censys](/osint/censys/) | Critical exposures: +40-60 |
| Email security | SPF/DKIM/DMARC analysis | Missing protections: +15 |
| Vulnerability indicators | [VirusTotal](/osint/virustotal/), [NVD](/osint/nvd/) | Known vulnerabilities: +20-40 |

The cyber dimension leverages the platform's [EASM capabilities](/capabilities/easm/) and [Prismatic Perimeter](/glossary/prismatic-perimeter/) integration to provide security assessment data.

## Scoring Methodology

### Dimension Score Computation

Each dimension's raw score is computed by summing the scoring impacts of all detected risk indicators, capped at 100:

```
dimension_raw_score = min(100, sum(indicator_impacts))
```

The raw score is then adjusted for evidence confidence:

```
dimension_adjusted_score = dimension_raw_score * evidence_confidence
```

Where `evidence_confidence` is the average [triple-check](/dd/methodology/) confidence score of the underlying data points, ranging from 0.0 to 1.0. This ensures that risk scores based on well-verified data carry more weight than scores based on low-confidence findings.

### Overall Risk Score

The overall risk score combines weighted dimension scores onto the 300-900 scale:

```
composite = sum(dimension_adjusted_score[i] * weight[i]) for i in dimensions
overall_score = 900 - (composite * 6)
```

This produces a score where 900 represents minimal risk and 300 represents maximum risk, consistent with industry conventions where higher scores indicate better risk posture.

### Letter Grade Mapping

| Grade | Score Range | Risk Level | Description |
|-------|------------|------------|-------------|
| **A** | 800 - 900 | Minimal | Excellent risk posture across all dimensions |
| **B** | 700 - 799 | Low | Good risk posture with minor concerns |
| **C** | 600 - 699 | Moderate | Acceptable with identified risk areas requiring attention |
| **D** | 500 - 599 | Elevated | Significant risk areas requiring mitigation |
| **E** | 400 - 499 | High | Material risk concerns across multiple dimensions |
| **F** | 300 - 399 | Critical | Critical risk indicators; due diligence red flags |

### Automatic Grade Overrides

Certain findings trigger automatic grade overrides regardless of the computed numeric score:

| Finding | Override | Rationale |
|---------|----------|-----------|
| Direct sanctions match (entity or UBO) | F (300) | Regulatory prohibition |
| Active insolvency proceeding | Maximum D (599) | Material financial impairment |
| Unknown beneficial ownership | Maximum C (699) | Regulatory non-compliance risk |
| Criminal proceedings against directors | Maximum D (599) | Governance risk |

## Confidence-Weighted Scoring

### Evidence Quality Assessment

The risk assessment framework integrates directly with the [triple-check cross-validation methodology](/dd/methodology/) to weight risk indicators by their evidentiary strength:

| Evidence Quality | Confidence Range | Score Modifier |
|-----------------|-----------------|----------------|
| **Verified** (3+ independent sources) | 0.95 - 1.00 | Full weight (1.0x) |
| **High confidence** (2+ sources) | 0.80 - 0.94 | 0.9x weight |
| **Moderate confidence** (1 authoritative source) | 0.60 - 0.79 | 0.7x weight |
| **Low confidence** (single non-authoritative source) | 0.40 - 0.59 | 0.4x weight |
| **Unverified** (unconfirmed) | 0.00 - 0.39 | Excluded from scoring |

This approach prevents low-quality or unverified data from disproportionately influencing risk scores while still allowing high-confidence single-source data (e.g., a government registry) to contribute meaningfully.

### Missing Data Handling

When data is unavailable for a risk dimension -- for example, when financial statements are not publicly filed -- the framework applies the [Absence Informative](/glossary/nabla-infinity/) principle from NABLA: the absence of data is itself informative. Missing financial data does not produce a zero financial risk score; instead, it produces an elevated score (typically +20-30) reflecting the increased uncertainty, with a reduced confidence level.

## Temporal Risk Tracking

### Risk Score Evolution

The platform maintains historical risk scores for all investigated entities, enabling trend analysis:

- **Improving trend**: Entity risk score has improved over successive assessments (e.g., insolvency proceedings resolved, compliance issues addressed)
- **Stable trend**: Risk score has remained within a narrow band across assessments
- **Deteriorating trend**: Risk score has worsened, indicating emerging risks
- **Volatile trend**: Risk score shows large swings between assessments, indicating instability

### Monitoring Alerts

For entities under [ongoing monitoring](/dd/case-management/), the platform generates alerts when:

- Overall risk grade changes (e.g., B to C)
- Any dimension score changes by more than 15 points
- A new sanctions match or PEP connection is detected
- An insolvency proceeding is initiated
- Ownership structure changes materially

## Integration with Decision Workflows

### M&A Decision Support

In [M&A due diligence](/dd/ma-due-diligence/), risk assessments feed directly into deal evaluation:

| Risk Grade | Deal Recommendation | Typical Action |
|------------|-------------------|---------------|
| A-B | Proceed | Standard due diligence complete |
| C | Proceed with conditions | Enhanced due diligence on flagged areas; risk mitigation in deal structure |
| D | Caution | Material risks identified; significant deal structure protections required |
| E | Elevated concern | Recommend pausing; deep investigation of critical risk areas |
| F | Do not proceed | Critical risks incompatible with transaction |

### Compliance Mapping

Risk assessment results map directly to [compliance framework](/dd/compliance/) requirements:

- **NIS2**: Supply chain risk assessment requirements satisfied by cyber and operational dimensions
- **ZKB**: Entity verification and cybersecurity assessment requirements addressed
- **AML/KYC**: Customer due diligence and enhanced due diligence requirements informed by financial, legal, and ownership dimensions

## Conclusion

The seven-dimensional Risk Assessment Framework provides a rigorous, evidence-based methodology for quantifying entity risk in due diligence investigations. By decomposing risk into distinct dimensions, weighting scores by evidence confidence, and providing both granular dimensional scores and an overall risk rating, the framework enables decision-makers to understand not just how risky an entity is, but specifically where the risks lie and how confident the assessment is. The integration with the platform's [triple-check methodology](/dd/methodology/) ensures that risk scores reflect verified intelligence rather than unsubstantiated indicators.

## References

- [Triple-Check Methodology](/dd/methodology/)
- [Graph Analysis Engine](/dd/graph-analysis/)
- [Compliance Framework](/dd/compliance/)
- [M&A Due Diligence](/dd/ma-due-diligence/)
- [OSINT Integration](/dd/osint-integration/)
- [Entity Management](/dd/entity-management/)
- [EASM Capability](/capabilities/easm/)
- [Security Rating](/glossary/security-rating/)
- [Risk Score](/glossary/risk-score/)
- [NABLA Infinity](/glossary/nabla-infinity/)

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
