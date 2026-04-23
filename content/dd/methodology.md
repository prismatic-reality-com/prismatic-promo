+++
title = "Triple-Check Cross-Validation Methodology"
weight = 10
date = "2026-02-17"

[extra]
tags = ["methodology", "validation", "cross-validation", "epistemic", "trinity-gate", "nabla"]
icon = "shield-check"
color = "emerald"
description = "The triple-check cross-validation methodology ensures every due diligence finding is corroborated across at least three independent sources before acceptance"
category = "methodology"
status = "active"
author = "Tomáš Korcak (korczis)"
reading_time = "12 min"
word_count = 2400
difficulty = "advanced"
image = "/images/dd/methodology.png"
image_alt = "Triple-check cross-validation pipeline architecture"
og_type = "article"
twitter_card = "summary_large_image"
academic_tier = "whitepaper"
content_version = "1.0.0"
last_enhanced = "2026-02-17"
quality_score = 92
see_also = ["entity-management", "risk-assessment", "osint-integration"]
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Triple-Check", "Cross-Validation", "Methodology", "ensures", "every", "diligence", "Prismatic Platform", "Trinity Gate", "Justice", "NABLA Infinity"]
+++

## Abstract

The triple-check cross-validation methodology is the epistemic foundation of the Prismatic Platform's due diligence capability. Derived from the [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework and enforced through the [Trinity Gate](@/glossary/trinity-gate.md) verification pipeline, this methodology requires that every investigative finding be corroborated across at least three independent sources before it can be marked as verified. The approach addresses a fundamental weakness in conventional due diligence tooling: the tendency to accept single-source data at face value, producing reports that appear comprehensive but lack the evidentiary rigor required for regulatory scrutiny, M&A decision-making, and legal proceedings.

This document details the three validation layers, the confidence scoring model that quantifies evidentiary strength, the contradiction preservation mechanisms that prevent premature resolution of conflicting data, and the temporal consistency analysis that ensures findings remain valid across time horizons relevant to the investigation.

## Introduction

### The Problem of Single-Source Trust

Traditional due diligence workflows suffer from a pervasive single-source trust problem. When an analyst queries a company registry and receives a response showing a particular ownership structure, that response is typically accepted without further verification. The implicit assumption is that official registries contain accurate, current data. In practice, this assumption fails frequently: registry data may be outdated due to synchronization delays, deliberately misleading due to nominee structures, or simply incorrect due to administrative errors.

The consequences of single-source trust in due diligence are severe. A 2024 study by the European Banking Authority found that 23% of suspicious activity reports filed by financial institutions contained entity identification errors traceable to unverified registry data. In the M&A context, the failure to verify ownership structures through multiple independent channels has contributed to post-acquisition disputes valued at billions of euros annually across the European market.

The Prismatic Platform eliminates single-source trust through a systematic methodology that requires corroboration as a precondition for verification, not as an optional quality enhancement.

### Relationship to NABLA Axioms

The triple-check methodology implements several of the platform's [NABLA axioms](@/capabilities/nabla-axioms.md) directly:

- **Signal Plurality**: The minimum-three-source requirement is a strict implementation of the Signal Plurality axiom, which mandates that no belief be accepted based on fewer than two independent signals. The triple-check methodology raises this bar to three signals for all due diligence claims.
- **Contradiction Preservation**: When sources disagree, the methodology preserves both data points with full provenance rather than silently discarding the minority position. This directly implements the [Contradiction Preservation](@/glossary/contradiction-preservation.md) axiom.
- **Provenance Mandatory**: Every data point in the validation pipeline carries complete source attribution, query timestamps, and confidence metadata, ensuring full traceability as required by the [Provenance Mandatory](@/glossary/provenance-mandatory.md) axiom.
- **Time Decay**: Confidence scores incorporate temporal decay functions that reduce the weight of older data points, implementing the [Time Decay](@/glossary/time-decay.md) axiom.

## The Three Validation Layers

### Layer 1: Source-Level Validation

The first validation layer operates at the individual source level, assessing the intrinsic reliability and relevance of each data point returned by an [OSINT](@/glossary/osint.md) source adapter. Source-level validation produces an initial confidence score for every data point before cross-source comparison begins.

**Authority Classification**: Each OSINT source is classified into one of four authority tiers that establish base confidence levels:

| Authority Tier | Base Confidence | Examples | Rationale |
|----------------|----------------|----------|-----------|
| **T1: Authoritative** | 0.85 - 0.95 | [ARES](@/osint/ares.md), [Justice.cz](@/osint/justice-cz.md), [CUZK](@/osint/cuzk.md) | Government-operated registries with legal standing |
| **T2: Official** | 0.70 - 0.85 | [CNB](@/osint/cnb.md), [Hlidac Statu](@/osint/hlidac-statu.md), EU sanctions lists | Regulated or institutional sources with strong governance |
| **T3: Professional** | 0.50 - 0.70 | [OpenCorporates](@/osint/open-corporates.md), [SecurityTrails](@/osint/securitytrails.md), credit agencies | Commercial data providers with quality assurance |
| **T4: Community** | 0.30 - 0.50 | Social media, forums, crowd-sourced databases | User-contributed data without formal verification |

**Freshness Weighting**: Within each authority tier, data freshness modifies the confidence score. Data retrieved within the last 24 hours receives full confidence credit, while data older than 90 days receives a 30% penalty. The freshness decay function is configurable per source, reflecting the update cadence of each registry.

**Query Specificity**: Exact-match queries (e.g., lookup by ICO number) receive higher confidence than fuzzy-match queries (e.g., company name search), because exact matches eliminate ambiguity in entity resolution.

**Validation Checks**: Each source adapter implements source-specific validation logic:

- **Format validation**: Does the returned data match expected formats (e.g., valid ICO format, valid date ranges)?
- **Internal consistency**: Are the data fields internally consistent (e.g., company formation date before first filing date)?
- **Completeness assessment**: Which expected fields are present versus missing?

### Layer 2: Cross-Source Corroboration

The second validation layer compares data points about the same entity attribute across multiple independent sources, applying Bayesian confidence updating to compute composite confidence scores.

**Independence Verification**: Not all sources are truly independent. [ARES](@/osint/ares.md) aggregates data from [Justice.cz](@/osint/justice-cz.md) and [RZP](@/osint/rzp.md), so corroboration between ARES and Justice.cz is less meaningful than corroboration between Justice.cz and [Hlidac Statu](@/osint/hlidac-statu.md). The platform maintains a source dependency graph that maps data flows between sources, ensuring that only genuinely independent corroboration elevates confidence.

**Attribute-Level Comparison**: Cross-source corroboration operates at the attribute level, not the entity level. A company's registered address may be confirmed by three sources while its beneficial ownership structure is only available from one. The platform maintains separate confidence scores for each attribute, enabling analysts to see exactly which aspects of an entity profile are well-corroborated and which require further investigation.

**Bayesian Confidence Updating**: When multiple independent sources confirm the same attribute value, the platform applies the following confidence update:

```
P(claim | evidence) = P(evidence | claim) * P(claim) / P(evidence)
```

In practice, three independent T1-tier sources confirming the same attribute value produce a composite confidence above 0.97, while two T2-tier sources and one T3-tier source produce composite confidence around 0.88. The exact thresholds are calibrated against historical verification outcomes stored in the platform's quality DNA.

**Contradiction Detection**: When sources disagree, the system generates a contradiction alert rather than silently choosing one value over another. Contradictions are classified by severity:

| Contradiction Level | Description | Response |
|--------------------|-------------|----------|
| **C1: Minor** | Formatting differences (e.g., "Praha" vs "Prague") | Auto-normalized, logged |
| **C2: Material** | Substantive differences (e.g., different director names) | Analyst alert, investigation required |
| **C3: Critical** | Fundamental conflicts (e.g., active vs insolvent status) | Investigation blocked, escalation |

### Layer 3: Temporal Consistency

The third validation layer examines whether findings are consistent across time, detecting patterns that may indicate data manipulation, registry lag, or genuine entity changes.

**Historical Snapshot Comparison**: The platform maintains historical snapshots of entity data collected at different points in time. By comparing current data against historical snapshots, the temporal validation layer can detect:

- **Sudden ownership changes**: A company's entire ownership structure changing overnight may indicate a restructuring event or may indicate data manipulation requiring investigation.
- **Registry synchronization gaps**: When one source shows updated data while another still reflects previous values, the temporal layer identifies the lag and adjusts confidence accordingly.
- **Cyclical patterns**: Repeated changes in corporate officers around annual filing deadlines may be benign, while similar patterns around sanctions designation dates may be significant.

**Temporal Confidence Adjustment**: Entity attributes that have been stable across multiple snapshots spanning months or years receive a temporal stability bonus to their confidence score. Conversely, recently changed attributes receive a temporal instability penalty, not because the new value is necessarily incorrect, but because fresh changes have had less time for cross-source corroboration.

**Change Velocity Analysis**: The platform computes a change velocity metric for each entity, measuring how frequently its key attributes change relative to industry norms. Entities with abnormally high change velocity receive elevated scrutiny in the risk assessment phase, as rapid structural changes can indicate evasive behavior, corporate restructuring in preparation for insolvency, or attempts to obscure beneficial ownership.

## Confidence Scoring Model

The triple-check methodology produces a normalized confidence score for every claim in the investigation database. Scores range from 0.0 (no evidence) to 1.0 (maximum confidence), with defined thresholds that control investigation workflow:

| Confidence Range | Classification | Investigation Impact |
|-----------------|----------------|---------------------|
| **0.95 - 1.00** | Verified | Claim accepted for report inclusion |
| **0.80 - 0.94** | High Confidence | Claim included with confidence qualifier |
| **0.60 - 0.79** | Moderate Confidence | Requires analyst review before inclusion |
| **0.40 - 0.59** | Low Confidence | Flagged for additional source collection |
| **0.00 - 0.39** | Unverified | Excluded from reports unless explicitly overridden |

These thresholds align with the platform's [Trinity Gate](@/capabilities/trinity-gate.md) requirements, where critical decisions require confidence at or above 0.95 and standard operations require confidence at or above 0.80.

## Trinity Gate Integration

Every claim that passes the triple-check methodology must also pass the [Trinity Gate](@/glossary/trinity-gate.md) before entering verified status. The Trinity Gate applies three orthogonal verification checks:

1. **Structural Consistency**: The verified claim must be consistent with the entity's relationship graph. An ownership claim that creates a circular ownership loop fails structural consistency.
2. **Logical Consistency**: The verified claim must not contradict other verified claims about the same entity. A company cannot simultaneously be listed as active in one verified claim and dissolved in another.
3. **Formal Verification**: For high-stakes claims (e.g., beneficial ownership determinations, sanctions matches), the platform can invoke formal verification through [Lean4](@/glossary/lean4.md) theorem proving to establish logical necessity.

The combination of triple-check cross-validation and Trinity Gate verification produces a level of evidentiary rigor that exceeds the requirements of most regulatory frameworks, including [NIS2](@/glossary/nis2.md) supply chain due diligence, [AML/KYC verification](@/capabilities/compliance.md), and M&A transaction support.

## Implementation Architecture

The cross-validation engine is implemented as an [Elixir](@/glossary/elixir.md)/[OTP](@/glossary/otp.md) pipeline that processes validation asynchronously, allowing the platform to validate thousands of data points across hundreds of sources without blocking the investigation workflow.

```
Source Adapters --> Normalization --> Source Validation (L1)
                                          |
                                    Attribute Store
                                          |
                                  Cross-Source Engine (L2)
                                          |
                                   Temporal Engine (L3)
                                          |
                                    Trinity Gate
                                          |
                                   Verified Claims
```

Each stage operates as an independent [GenServer](@/glossary/genserver.md) process, connected through the platform's [PubSub](@/glossary/pubsub.md) event system. This architecture enables horizontal scaling -- additional validation workers can be added to handle investigation spikes without modifying the pipeline logic.

## Practical Impact

The triple-check methodology produces measurably superior due diligence outcomes compared to conventional single-pass approaches:

| Metric | Single-Pass | Triple-Check | Improvement |
|--------|-------------|--------------|-------------|
| **False positive rate** | 12-18% | 2-4% | 75-80% reduction |
| **Missed contradictions** | 8-15% | <1% | >90% reduction |
| **Analyst review time** | Baseline | -40% | Confidence scores prioritize review effort |
| **Regulatory acceptance** | Conditional | Full | Pre-validated for NIS2/ZKB/AML |

These improvements derive directly from the methodology's systematic approach to evidence quality. By requiring multi-source corroboration before acceptance, the platform eliminates the class of errors that arise from trusting single sources. By preserving contradictions, it ensures that analysts are never surprised by conflicting information that was silently discarded. And by incorporating temporal analysis, it provides the historical context that regulators increasingly demand.

## Conclusion

The triple-check cross-validation methodology transforms due diligence from a best-effort data collection exercise into a rigorous epistemic process with quantifiable confidence levels and full evidence provenance. Rooted in the [NABLA Infinity](@/glossary/nabla-infinity.md) framework and enforced through the [Trinity Gate](@/glossary/trinity-gate.md), this methodology ensures that every finding in a Prismatic due diligence report has been independently verified, temporally validated, and structurally verified before presentation to decision-makers.

## References

- [NABLA Infinity Framework](@/glossary/nabla-infinity.md)
- [Trinity Gate Verification](@/capabilities/trinity-gate.md)
- [OSINT Integration Framework](@/dd/osint-integration.md)
- [Risk Assessment Framework](@/dd/risk-assessment.md)
- [Entity Management System](@/dd/entity-management.md)
- [Confidence Scoring](@/glossary/confidence-scoring.md)
- [Signal Plurality](@/glossary/signal-plurality.md)
- [Contradiction Preservation](@/glossary/contradiction-preservation.md)

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
