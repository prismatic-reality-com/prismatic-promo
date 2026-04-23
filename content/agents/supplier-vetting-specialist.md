+++
title = "supplier-vetting-specialist"
weight = 385
[extra]
domain = "compliance"
level = "L3"
description = "Deep supplier vetting agent for comprehensive due diligence investigations, combining formal verification with evidence-based compliance analysis across multiple regulatory frameworks."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["nis2", "zkb", "no-mercy", "no-doubts", "trinity-gate", "aiad", "attack-surface", "seadf", "telemetry", "lean4"]
domain_normalized = "compliance"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2050
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["supplier-vetting-specialist", "Deep", "agents", "agent", "Prismatic Platform", "Phase", "Theorem", "Below"]
tags = ["agents", "agent", "supplier-vetting-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "supplier-vetting-specialist - Prismatic Platform"
+++

## Overview

The Supplier Vetting Specialist is an L3 strategic command agent operating within the Prismatic Platform's compliance domain, designed for deep-dive due diligence investigations of suppliers, vendors, and third-party service providers. While initial supplier risk assessments identify entities requiring further scrutiny, the Supplier Vetting Specialist conducts the thorough investigative analysis needed to make definitive accept, reject, or conditional-approval decisions about supplier relationships.

This agent integrates formal verification methodologies with evidence-based compliance analysis, leveraging [Lean4](/glossary/lean4/) theorem proving to ensure that vetting conclusions are logically sound and that the evidence chains supporting those conclusions are structurally valid. Operating within the [AIAD](/glossary/aiad/) standard framework, the agent enforces the [No Mercy, No Doubts](/glossary/no-mercy/) doctrine through its uncompromising approach to evidence quality and analytical completeness.

## Theoretical Foundations

Supplier vetting represents a specialized application of investigative due diligence, drawing from forensic accounting, corporate intelligence, and regulatory compliance disciplines. The academic literature on third-party risk management identifies information asymmetry as the fundamental challenge in supplier evaluation. Suppliers possess private information about their own risks, capabilities, and practices that may not be voluntarily disclosed to prospective business partners.

The agent addresses this asymmetry through systematic open-source intelligence ([OSINT](/glossary/osint/)) collection, public record analysis, and structured analytical frameworks that surface hidden risk indicators. The theoretical basis combines adverse selection models from contract theory with signal detection theory from statistical decision-making, creating an analytical framework that optimizes the trade-off between false positives (rejecting acceptable suppliers) and false negatives (approving risky suppliers).

The formal verification component draws from constructive mathematics and dependent type theory, where [Lean4](/glossary/lean4/) proofs validate the logical consistency of vetting conclusions. Five core theorems govern the agent's evolutionary safety, ensuring that modifications to vetting criteria or scoring algorithms preserve the correctness properties established during initial verification.

## Core Capabilities

The Supplier Vetting Specialist delivers comprehensive investigative capabilities across multiple analytical dimensions.

**Deep Background Investigation** examines the full corporate history of a supplier, including all name changes, ownership transfers, jurisdictional movements, and structural reorganizations. The investigation extends to the personal backgrounds of directors, beneficial owners, and key management personnel, identifying any associations with adverse events, regulatory sanctions, or entities of concern.

**Financial Forensics** goes beyond surface-level financial health assessment to examine the quality and consistency of financial reporting. The agent detects anomalies in revenue recognition patterns, unusual related-party transactions, aggressive accounting practices, and discrepancies between reported figures and external validation sources. For entities required to file audited accounts, the agent evaluates audit opinions and auditor continuity as indicators of financial reporting integrity.

**Compliance Verification** assesses the supplier's adherence to applicable regulatory frameworks through structured evidence collection. For European suppliers, this includes [NIS2](/glossary/nis2/) cybersecurity compliance assessment, GDPR data protection practices, and industry-specific regulatory requirements. For Czech entities, the agent applies [ZKB](/glossary/zkb/) compliance criteria and cross-references against Czech regulatory enforcement databases.

**Supply Chain Depth Analysis** traces the supplier's own supply chain dependencies to identify concentration risks, single points of failure, and potential sanctions exposure through sub-tier relationships. This recursive analysis ensures that risks hidden in lower supply chain tiers are surfaced during the vetting process.

**Litigation and Dispute Analysis** aggregates court records, arbitration proceedings, and regulatory enforcement actions involving the supplier to assess the frequency, severity, and nature of legal disputes. Pattern analysis distinguishes between routine commercial disputes and systematic patterns that indicate governance or ethical concerns.

## Architecture and Implementation

The agent operates as an [OTP](/glossary/otp/)-supervised process within the Prismatic compliance subsystem, implementing a multi-phase investigation pipeline with configurable depth levels.

| Phase | Investigation Depth | Typical Duration |
|-------|-------------------|------------------|
| Phase 1: Identity Verification | Confirm legal identity and registration status | Minutes |
| Phase 2: Ownership Mapping | Trace beneficial ownership through corporate layers | Minutes to hours |
| Phase 3: Financial Analysis | Evaluate financial health and reporting quality | Hours |
| Phase 4: Compliance Assessment | Verify regulatory adherence across frameworks | Hours |
| Phase 5: Deep Investigation | Conduct forensic-level analysis of flagged areas | Days |

Each phase produces structured findings that are validated through the [Trinity Gate](/glossary/trinity-gate/) verification system before advancing to subsequent phases. This staged approach allows early termination of investigations where disqualifying findings emerge in initial phases, optimizing resource allocation across the investigation portfolio.

The agent's state machine tracks each investigation through well-defined lifecycle stages: initiated, evidence-collection, analysis, peer-review, conclusion, and archived. State transitions emit telemetry events that enable real-time monitoring of investigation progress and pipeline throughput.

## Formal Verification Framework

The integration of [Lean4](/glossary/lean4/) formal verification distinguishes the Supplier Vetting Specialist from conventional due diligence tools. Five core theorems govern the agent's reasoning:

**Theorem 1 (Evidence Sufficiency)**: A vetting conclusion requires a minimum evidence threshold proportional to the risk level of the decision. This theorem prevents premature conclusions based on insufficient investigation.

**Theorem 2 (Contradiction Preservation)**: Contradictory evidence must be explicitly preserved and resolved rather than silently discarded. This enforces the [NABLA Infinity](/glossary/nabla-infinity/) addiction preservation principle within the vetting context.

**Theorem 3 (Conclusion Monotonicity)**: Additional evidence can only strengthen or maintain the confidence level of a conclusion, never arbitrarily weaken it without explicit contradiction detection. This ensures stability in the reasoning process.

**Theorem 4 (Source Independence)**: The weight assigned to a finding increases with the number of independent sources that corroborate it. Findings from a single source receive appropriate uncertainty markers.

**Theorem 5 (Temporal Decay)**: Evidence relevance decreases over time according to a configurable decay function, ensuring that stale information does not inappropriately influence current assessments.

These theorems are implemented as Lean4 propositions with machine-checked proofs, providing mathematical guarantees about the correctness of the vetting reasoning engine.

## Risk Scoring and Decision Framework

The vetting process produces a multi-dimensional risk profile that supports structured decision-making. Each risk dimension receives an independent score with associated confidence intervals.

| Dimension | Weight | Scoring Range | Critical Threshold |
|-----------|--------|---------------|-------------------|
| Financial Stability | 25% | 0-100 | Below 30 |
| Regulatory Compliance | 25% | 0-100 | Below 40 |
| Ownership Transparency | 20% | 0-100 | Below 25 |
| Operational Resilience | 15% | 0-100 | Below 35 |
| Reputational Standing | 15% | 0-100 | Below 30 |

The decision framework maps composite scores to actionable recommendations: approve (score above 70 with no critical-threshold breaches), conditional approve (score 50-70 with specified mitigation requirements), enhanced monitoring (score 40-50 with ongoing surveillance), or reject (score below 40 or any critical-threshold breach).

## Integration Points

| System | Integration Purpose | Data Flow |
|--------|-------------------|-----------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Agent lifecycle and task orchestration | Bidirectional |
| [AIAD Registry](/glossary/registry-otp/) | Agent specification and discovery | Read |
| [GARDEN](/glossary/garden/) Knowledge Base | Historical vetting patterns and outcomes | Read/Write |
| [Prismatic Telemetry](/glossary/telemetry/) | Performance metrics and investigation tracking | Write |
| Czech Business Registry | Corporate registration data | Read |
| Insolvency Register | Insolvency proceeding status | Read |
| Court Records Databases | Litigation history aggregation | Read |
| [SEADF](/glossary/seadf/) | Autonomous evolution and self-improvement | Bidirectional |

The agent publishes comprehensive telemetry covering investigation initiation, phase transitions, evidence acquisition events, and conclusion delivery. These metrics support operational oversight and enable the SEADF framework to identify optimization opportunities in the investigation pipeline.

## Compliance Regulatory Mapping

The Supplier Vetting Specialist maintains structured mappings between vetting criteria and regulatory requirements, ensuring that every investigation satisfies applicable compliance obligations.

For NIS2-governed entities, the agent evaluates suppliers against Article 21 supply chain security requirements, assessing whether suppliers maintain appropriate cybersecurity practices and incident reporting capabilities. For entities subject to Czech ZKB regulation, additional criteria address critical infrastructure supply chain obligations specific to the Czech regulatory environment.

Anti-money laundering customer due diligence (CDD) and enhanced due diligence (EDD) requirements are implemented as configurable investigation templates that activate based on the risk classification of the entity under investigation. Know Your Customer (KYC) data collection follows a standardized protocol that satisfies requirements across multiple regulatory regimes simultaneously.

## Quality Assurance

Every vetting conclusion undergoes multi-layer validation. The Trinity Gate verification system checks structural consistency of the evidence graph, logical consistency of the reasoning chain, and formal necessity of the conclusion given the available evidence. Peer review protocols require that high-risk rejection or approval decisions are independently validated by a second analytical pathway before finalization.

The agent maintains calibration metrics that compare predicted risk levels against observed outcomes for previously vetted suppliers, enabling continuous refinement of scoring models and decision thresholds. [Property-based testing](/glossary/property-based-testing/) validates that the scoring engine behaves consistently across the full space of possible input combinations.

## Operational Considerations

Investigation depth and resource allocation are calibrated to the risk level of the supplier relationship under evaluation. Low-risk, low-value supplier relationships receive streamlined vetting through Phases 1-3, while strategic or high-value relationships undergo the full five-phase investigation. This risk-proportionate approach optimizes investigative resources while ensuring that critical supplier relationships receive appropriately thorough analysis.

## Related Agents

The Supplier Vetting Specialist works in close coordination with the [supplier-risk-specialist](/agents/supplier-risk-specialist/), which provides initial risk screening that identifies candidates for deep vetting. The [supreme-court-specialist](/agents/supreme-court-specialist/) contributes legal proceeding analysis for Czech jurisdiction cases. Agents in the [OSINT](/glossary/osint/) domain provide specialized data collection capabilities that feed into the vetting evidence corpus.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)