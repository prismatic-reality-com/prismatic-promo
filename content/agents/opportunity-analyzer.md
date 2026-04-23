+++
title = "Opportunity Analyzer"
weight = 280
[extra]
domain = "primary-producer"
level = "L2"
description = "Sales opportunity analysis and qualification specialist with multi-dimensional scoring and market intelligence integration"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "seadf", "mycelial-network", "otp", "no-doubts", "telemetry", "no-mercy"]
domain_normalized = "primary"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2100
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Opportunity", "Analyzer", "Sales", "agents", "agent", "Prismatic Platform", "Stage", "OSINT", "Opportunity Analyzer"]
tags = ["agents", "agent", "opportunity-analyzer", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Opportunity Analyzer - Prismatic Platform"
+++

## Overview

The Opportunity Analyzer operates as an L2 Tactical Operations authority within the Prismatic Platform's primary-producer domain, specializing in the identification, qualification, and prioritization of business opportunities through systematic intelligence analysis. This agent evaluates potential engagements across multiple dimensions -- market fit, technical feasibility, competitive positioning, resource requirements, and risk-adjusted return -- to produce structured opportunity assessments that support strategic decision-making. Its analytical framework ensures that opportunity evaluation is evidence-driven rather than intuition-based.

Built on the [AIAD](@/glossary/aiad.md) standard, the Opportunity Analyzer applies the [NO DOUBTS](@/glossary/no-doubts.md) principle to every assessment: no opportunity is qualified without multi-dimensional evidence, and all scoring carries explicit confidence intervals. The agent leverages platform [OSINT](@/glossary/osint.md) capabilities to enrich opportunity profiles with market intelligence, competitive landscape data, and prospect technology stack analysis. The [NABLA Infinity](@/glossary/nabla-infinity.md) framework governs information handling, ensuring that contradictory signals about opportunity viability are preserved and surfaced rather than averaged into misleading composite scores.

## Theoretical Foundations

Opportunity analysis draws from decision theory, multi-criteria decision analysis (MCDA), and portfolio optimization. The analyzer implements a modified TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution) framework where each opportunity is evaluated against an ideal opportunity profile and a negative-ideal profile across multiple criteria dimensions. The resulting scores indicate how closely each opportunity resembles the ideal case and how far it deviates from the worst case.

The qualification framework applies Bayesian updating to opportunity assessments. Initial qualification scores represent prior beliefs based on surface-level indicators (market segment, deal size, source quality). As additional intelligence is gathered -- technical discovery findings, competitive landscape analysis, stakeholder mapping -- the scores are updated using Bayes' rule, producing posterior qualification scores that incorporate all available evidence. This approach naturally handles uncertainty: opportunities with limited evidence receive wide confidence intervals that narrow as more intelligence is collected.

Risk assessment follows a Monte Carlo simulation approach where uncertainty in individual opportunity parameters (win probability, deal timeline, implementation complexity) is propagated through the assessment model to produce risk-adjusted expected value distributions rather than point estimates. This enables comparison of opportunities based on their risk-adjusted profiles rather than overly optimistic deterministic projections.

## Operational Domain

The opportunity analysis domain covers lead qualification, market sizing, competitive analysis, technical feasibility assessment, and deal scoring across business development workflows. The agent maintains qualification criteria matrices that adapt to different market segments and engagement types. Opportunity scoring models incorporate both quantitative [metrics](@/glossary/metrics.md) (market size, win probability, resource cost) and qualitative indicators (strategic fit, relationship strength, reference potential).

The domain maintains an opportunity pipeline that tracks opportunities through lifecycle stages: identification, initial qualification, deep analysis, proposal, negotiation, and decision. Each stage transition requires the opportunity to meet stage-specific qualification thresholds, preventing low-quality opportunities from consuming analysis resources in later stages.

## Key Capabilities

- **Multi-dimensional opportunity scoring** -- Evaluates opportunities across financial, technical, strategic, and relationship dimensions, producing weighted composite scores with per-dimension breakdowns and explicit confidence intervals
- **Market intelligence integration** -- Enriches opportunity profiles with market size estimates, competitive positioning data, and industry trend analysis sourced from the platform's OSINT infrastructure
- **Technical feasibility assessment** -- Evaluates the technical viability of proposed engagements by analyzing capability alignment, integration complexity, and resource availability against the platform's technology stack
- **Competitive landscape mapping** -- Identifies and profiles competing solutions and vendors in opportunity contexts, assessing competitive strengths and vulnerabilities through systematic intelligence collection
- **Risk-adjusted valuation** -- Applies Monte Carlo simulation to propagate uncertainty through opportunity valuation models, producing probability-weighted expected value distributions
- **Pipeline analytics** -- Maintains comprehensive pipeline analytics including conversion rates per stage, average cycle times, and qualification model calibration metrics
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with self-directed opportunity monitoring and re-qualification when new intelligence emerges
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** for pipeline analytics, conversion tracking, and qualification model calibration

## Authority Level

**L2** - Tactical Operations - Domain-specific [tactical execution](@/glossary/tactical-execution.md) authority for opportunity analysis and qualification workflows.

## Qualification Framework

The qualification framework implements a five-stage evaluation process. **Stage 1: Initial Screening** applies fast-reject criteria (minimum deal size, market segment alignment, geographic fit) to eliminate clearly unqualified opportunities. **Stage 2: Surface Analysis** evaluates publicly available information to produce initial qualification scores with wide confidence intervals. **Stage 3: Deep Discovery** gathers detailed intelligence through OSINT collection, technical assessment, and stakeholder mapping to refine scores. **Stage 4: Competitive Positioning** evaluates the opportunity in the context of known competitive dynamics, assessing win probability and strategic positioning. **Stage 5: Final Qualification** produces the comprehensive opportunity assessment including risk-adjusted valuation, resource requirements, and strategic recommendation.

Each stage narrows the confidence intervals on qualification scores as additional evidence is incorporated. Opportunities that fail to meet stage-specific thresholds are either rejected or returned to earlier stages for additional evidence collection.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/opportunity analyze` | Initiate comprehensive analysis of a specified opportunity | L2+ |
| `/opportunity qualify` | Run qualification scoring against current criteria matrix | L2+ |
| `/opportunity pipeline` | Display current opportunity pipeline with scoring summaries | L2+ |
| `/opportunity compare` | Compare multiple opportunities across all scoring dimensions | L2+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [ma-tech-assessor](@/agents/ma-tech-assessor.md) | Provides technology assessment data for technical feasibility evaluation |
| [risk-assessment-commander](@/agents/risk-assessment-commander.md) | Supplies risk context for opportunity risk-adjusted return modeling |
| [marksman-jtac](@/agents/marksman-jtac.md) | High-value opportunities are designated as targets for precision engagement |
| [linkedin-intelligence-specialist](@/agents/linkedin-intelligence-specialist.md) | Professional network data enriches prospect relationship mapping |
| [osint-intelligence-operative](@/agents/osint-intelligence-operative.md) | OSINT collection provides market intelligence for opportunity enrichment |

## Model Calibration

The qualification model is continuously calibrated against historical outcomes. When opportunities reach terminal states (won, lost, abandoned), the actual outcome is compared against the model's predicted qualification score and win probability. Systematic deviations between predictions and outcomes trigger model recalibration: if the model consistently overestimates win probability for a specific market segment, the segment-specific priors are adjusted downward. This calibration loop ensures that the model improves over time rather than drifting from reality.

## Enforcement

Opportunity assessments must comply with the [NO MERCY](@/glossary/no-mercy.md) doctrine: no incomplete analyses are published, every score includes full factor attribution, and over-optimistic qualification without supporting evidence is rejected. All assessments carry mandatory [NABLA Infinity](@/glossary/nabla-infinity.md) provenance chains, and the [Trinity Gate](@/glossary/trinity-gate.md) validates structural, logical, and formal consistency of all published assessments.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)