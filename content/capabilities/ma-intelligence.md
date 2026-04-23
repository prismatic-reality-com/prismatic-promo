+++
title = "M&A Intelligence"
weight = 14
[extra]
icon = "briefcase"
color = "indigo"
description = "Automated due diligence, corporate entity resolution, financial analysis, and multi-source intelligence synthesis for mergers and acquisitions"
category = "intelligence"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 992
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Intelligence", "Automated", "capabilities", "Prismatic Platform", "Cross", "Sanctions", "Trinity Gate"]
tags = ["capabilities", "intelligence", "ma-intelligence", "prismatic"]
quality_score = 75
see_also = ["glossary", "agents", "architecture"]
image = "/images/sections/capabilities.png"
image_alt = "M&A Intelligence - Prismatic Platform"
+++

## Overview

M&A Intelligence is the Prismatic Platform's capability for automating and enhancing the due diligence process in mergers, acquisitions, and corporate investment decisions. It combines automated corporate entity resolution across multiple registries, financial analysis from public and proprietary data sources, risk assessment through multi-layer verification, and intelligence synthesis from 121+ OSINT sources into a unified due diligence workflow. The platform transforms what is traditionally a manual, weeks-long process into a systematic, evidence-based assessment pipeline that produces verifiable, confidence-scored intelligence products.

Corporate due diligence has historically suffered from three systemic weaknesses: incomplete source coverage, inconsistent assessment methodology, and inability to verify the provenance of findings. The Prismatic M&A Intelligence module addresses all three by applying the platform's [NABLA axiom](/capabilities/nabla-axioms/) framework to every stage of the due diligence process, ensuring that no finding is accepted without multi-source corroboration, no contradiction is discarded, and every conclusion carries a traceable evidence chain.

## Due Diligence Automation

### Assessment Pipeline

The M&A due diligence pipeline transforms a target entity identifier into a comprehensive intelligence dossier through a series of automated stages:

```
Target Entity --> Entity Resolution --> Registry Collection --> Financial Analysis --> Risk Assessment --> Intelligence Synthesis --> Dossier
     |                  |                      |                      |                     |                      |                   |
  Name/ICO          Cross-registry         ARES, ISIR             Balance sheets        Sanctions             NABLA axioms       Verified
  DUNS/LEI          identity merge         Justice.cz             Ownership graphs      PEP screening         Trinity Gate       report
                                           EU registries          Cash flow analysis    Litigation check      Confidence scores
```

### Automated Collection Domains

| Domain | Sources | Data Points | Update Frequency |
|--------|---------|-------------|-----------------|
| **Corporate Registry** | ARES, Justice.cz, EU business registers | Legal form, directors, shareholders, registered capital | Daily |
| **Financial Records** | Public filings, annual reports, credit agencies | Revenue, assets, liabilities, cash flow, ratios | Quarterly |
| **Litigation & Insolvency** | ISIR, court records, enforcement databases | Active proceedings, historical judgments, enforcement orders | Daily |
| **Sanctions & PEP** | EU Sanctions List, OFAC SDN, national PEP lists | Sanctions matches, politically exposed person status | Real-time |
| **Beneficial Ownership** | UBO registers, ownership chain analysis | Ultimate beneficial owners, control structures | Monthly |
| **Intellectual Property** | Patent offices, trademark registries | Patent portfolio, trademark status, IP disputes | Weekly |
| **Media & Reputation** | News archives, social media, industry publications | Sentiment analysis, controversy detection, executive profile | Continuous |

## Corporate Entity Resolution

### Cross-Registry Identity Linking

A single corporate entity may appear differently across multiple registries -- different name formatting, transliteration variations, historical name changes, and inconsistent identifier usage. The entity resolution engine links these disparate records into a unified entity profile:

```elixir
# Cross-registry entity resolution
{:ok, unified} = PrismaticDD.resolve_entity(%{
  ares: %{ico: "27082440", name: "Alza.cz a.s."},
  justice: %{ico: "27082440", name: "ALZA.CZ, a.s."},
  isir: %{debtor_ico: "27082440", name: "Alza.cz akciova spolecnost"},
  eu_register: %{lei: "315700BNHP2R1VUXGQ42", name: "Alza.cz a.s."}
})
# => %UnifiedEntity{
#   primary_name: "Alza.cz a.s.",
#   identifiers: %{ico: "27082440", lei: "315700BNHP2R1VUXGQ42"},
#   name_variants: ["ALZA.CZ, a.s.", "Alza.cz akciova spolecnost"],
#   resolution_confidence: 0.99,
#   sources: [:ares, :justice, :isir, :eu_register]
# }
```

### Resolution Methods

| Method | Application | Accuracy | Speed |
|--------|------------|----------|-------|
| **Deterministic** | Exact identifier match (ICO, DUNS, LEI, VAT ID) | 100% | Instant |
| **Fuzzy Name Matching** | Diacritics normalization, abbreviation expansion, transliteration | 85-95% | Milliseconds |
| **Network-Based** | Shared directors, registered address, ownership overlap | 90-98% | Seconds |
| **Temporal Linking** | Historical name changes, mergers, demergers tracked over time | 80-95% | Seconds |
| **Cross-Jurisdictional** | Mapping between national identifier systems (ICO to LEI to DUNS) | 92-99% | Seconds |

### Ownership Graph Construction

The platform builds multi-layer ownership graphs that reveal the full corporate structure behind a target entity:

```
Ultimate Beneficial Owner (UBO)
  |
  +-- Holding Company A (Country X, 60% ownership)
  |     |
  |     +-- Target Entity (CZ, 100% subsidiary)
  |     |     |
  |     |     +-- Operating Subsidiary 1 (CZ, 100%)
  |     |     +-- Operating Subsidiary 2 (SK, 80%)
  |     |
  |     +-- Sister Company (DE, 100% subsidiary)
  |
  +-- Holding Company B (Country Y, 40% ownership)
        |
        +-- Shared Director with PEP status (flagged)
```

These graphs are constructed from registry data, augmented with beneficial ownership information, and cross-referenced against sanctions and PEP databases at every node.

## Financial Analysis

### Automated Financial Assessment

The platform extracts and analyzes financial data from publicly available filings, computing standard financial health indicators:

| Category | Metrics | Assessment |
|----------|---------|------------|
| **Liquidity** | Current ratio, quick ratio, cash ratio | Short-term obligation coverage |
| **Solvency** | Debt-to-equity, interest coverage, debt ratio | Long-term financial stability |
| **Profitability** | ROE, ROA, EBITDA margin, net margin | Earnings capability and efficiency |
| **Growth** | Revenue CAGR, asset growth, employee growth | Expansion trajectory |
| **Working Capital** | Days receivable, days payable, inventory turnover | Operational efficiency |
| **Valuation** | Revenue multiples, asset-based valuation, comparable analysis | Fair value estimation |

### Anomaly Detection

Financial analysis includes automated detection of patterns that warrant deeper investigation:

| Anomaly Type | Detection Method | Risk Indicator |
|-------------|-----------------|----------------|
| **Revenue manipulation** | Benford's Law analysis on reported figures | Digit distribution deviation |
| **Related party transactions** | Cross-reference with ownership graph | High-value transactions with connected entities |
| **Sudden changes** | Year-over-year deviation exceeding 2 standard deviations | Unexplained spikes or drops |
| **Inconsistent reporting** | Cross-check between registry filings and tax records | Discrepancies between data sources |
| **Going concern indicators** | Negative working capital trend, accumulated losses | Viability risk assessment |

## Risk Assessment

### Multi-Layer Risk Framework

Risk assessment operates across five independent domains, each producing a domain-specific risk score that feeds into the composite M&A risk rating:

| Risk Domain | Assessment Scope | Weight | Key Indicators |
|------------|-----------------|--------|----------------|
| **Legal Risk** | Litigation, regulatory actions, compliance history | 25% | Active lawsuits, enforcement orders, regulatory fines |
| **Financial Risk** | Solvency, liquidity, profitability trends | 25% | Declining ratios, negative cash flow, debt covenants |
| **Sanctions Risk** | Sanctions lists, PEP associations, restricted jurisdictions | 20% | Direct/indirect sanctions exposure, PEP relationships |
| **Reputational Risk** | Media sentiment, controversy history, executive conduct | 15% | Negative coverage, scandal history, executive turnover |
| **Operational Risk** | Business continuity, key person dependency, supply chain | 15% | Concentration risk, succession gaps, vendor dependency |

### Confidence-Scored Findings

Every risk finding carries a confidence score computed according to the [NABLA axiom](/capabilities/nabla-axioms/) framework:

```elixir
# Risk assessment with confidence scores
{:ok, risk_profile} = PrismaticDD.assess_risk("27082440")
# => %{
#   overall_risk: :moderate,
#   composite_score: 42,
#   domains: %{
#     legal: %{score: 35, confidence: 0.92, findings: 2},
#     financial: %{score: 28, confidence: 0.88, findings: 5},
#     sanctions: %{score: 0, confidence: 0.97, findings: 0},
#     reputational: %{score: 55, confidence: 0.75, findings: 3},
#     operational: %{score: 62, confidence: 0.71, findings: 4}
#   },
#   contradictions: [
#     %{
#       finding: "Strong revenue growth vs declining cash position",
#       sources: [:financial_filings, :credit_agency],
#       requires_investigation: true
#     }
#   ]
# }
```

Note the `contradictions` field: following the [Addiction Preservation](/glossary/contradiction-preservation/) doctrine, contradictory signals are preserved and surfaced rather than resolved through premature judgment.

## Intelligence Synthesis for M&A

### Dossier Generation

The final output of the M&A Intelligence pipeline is a comprehensive dossier that synthesizes all collected data, analysis results, and risk assessments into a structured, verifiable document:

| Dossier Section | Content | Verification Level |
|----------------|---------|-------------------|
| **Executive Summary** | Overall assessment, key findings, recommendation | Trinity Gate verified |
| **Entity Profile** | Resolved identity, corporate structure, history | Multi-source confirmed |
| **Financial Analysis** | Health indicators, trend analysis, anomalies | Source-provenance attached |
| **Ownership Structure** | UBO identification, control chain, related parties | Cross-registry verified |
| **Risk Assessment** | Domain scores, findings, contradictions | NABLA axiom compliant |
| **Compliance Check** | Sanctions screening, PEP associations, regulatory status | Real-time verified |
| **Source Inventory** | All sources consulted, data freshness, coverage gaps | Full provenance chain |

### Epistemic Rigor

Every dossier section passes through [Trinity Gate](/capabilities/trinity-gate/) verification:

1. **Structural Consistency**: The evidence graph forms a valid DAG with no circular reasoning
2. **Logical Consistency**: Conclusions follow from evidence without logical fallacies
3. **Formal Verification**: Critical claims (sanctions status, ownership chains) formally proved
4. **Consciousness Layer**: Meta-assessment of the assessment methodology itself

Findings that fail Trinity Gate are flagged as unverified with explicit explanation of which gate failed and why, rather than being silently excluded.

## Integration

- Built on [Intelligence Synthesis](/capabilities/intelligence-synthesis/) multi-source fusion pipeline
- All findings verified through [Trinity Gate](/capabilities/trinity-gate/) 4-layer validation
- Governed by [NABLA Axioms](/capabilities/nabla-axioms/) epistemic framework
- Enforces [NO DOUBTS](/capabilities/no-doubts/) evidence-based decision making
- Quality enforced by [NO MERCY](/capabilities/no-mercy/) zero-tolerance standards
- Agent operations tracked via [Telemetry Integration](/capabilities/telemetry-integration/)
- EASM data from [External Attack Surface Management](/capabilities/easm/) feeds cybersecurity risk domain
- Monitored through [Real-Time Monitoring](/capabilities/real-time-monitoring/) infrastructure
- Supports [Cross-Domain Flexibility](/capabilities/cross-domain-flexibility/) through adapter-based source integration

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)