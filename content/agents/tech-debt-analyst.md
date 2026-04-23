+++
title = "tech-debt-analyst"
weight = 394
[extra]
domain = "primary-producer"
level = "L2"
description = "Specialized analyst for technical debt assessment, quantification, and remediation planning across the platform's 90+ application umbrella."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "seadf", "mycelial-network", "otp", "no-doubts", "telemetry", "no-mercy", "qdp", "cascade", "trinity-gate"]
domain_normalized = "primary"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 83
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["tech-debt-analyst", "Specialized", "agents", "agent", "Prismatic Platform", "The Tech", "Debt Analyst", "High"]
tags = ["agents", "agent", "tech-debt-analyst", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "tech-debt-analyst - Prismatic Platform"
+++

## Overview

The Tech Debt Analyst is an L2 tactical operations agent operating within the Prismatic Platform's primary-producer domain, specialized in the systematic assessment, quantification, and remediation planning of technical debt across the platform's 90+ application umbrella. Technical debt, the implicit cost of future rework caused by choosing expedient solutions over thorough implementations, represents one of the most significant long-term risks to software platform sustainability. This agent provides the analytical intelligence needed to identify, measure, prioritize, and plan the elimination of technical debt before it compounds into critical maintainability or reliability problems.

The Prismatic Platform has achieved complete quality debt elimination (0 QDP), a state that required sustained systematic analysis of debt sources, prioritized remediation campaigns, and ongoing monitoring to prevent debt reaccumulation. The Tech Debt Analyst played a central role in this achievement and continues to operate as the primary early warning system for debt accumulation. Under the [AIAD](@/glossary/aiad.md) standard and [No Mercy, No Doubts](@/glossary/no-mercy.md) doctrine, the agent treats technical debt as an unacceptable condition that demands immediate quantification and scheduled elimination.

## Theoretical Foundations

The concept of technical debt was introduced by Ward Cunningham in 1992 as a metaphor relating expedient software development decisions to financial debt. Like financial debt, technical debt incurs interest in the form of increased maintenance cost, higher defect rates, and reduced development velocity. The Tech Debt Analyst extends this metaphor into a formal quantitative framework.

The research literature identifies multiple categories of technical debt: code debt (poor code quality), design debt (suboptimal architectural decisions), test debt (inadequate test coverage), documentation debt (missing or outdated documentation), and infrastructure debt (outdated tooling and dependencies). The agent maintains assessment models for each category, recognizing that different debt types require different identification methods and remediation approaches.

The concept of the technical debt quadrant, introduced by Martin Fowler, distinguishes between deliberate/inadvertent and reckless/prudent debt. The agent's classification system maps identified debt items onto this quadrant, enabling prioritization that considers both the origin and intentionality of each debt instance.

From financial mathematics, the agent borrows concepts of compound interest and net present value to model how technical debt grows over time when left unaddressed. The "interest rate" of technical debt represents the ongoing cost of working around poor code, while the "principal" represents the one-time cost of proper remediation. These financial analogies enable cost-benefit analysis that supports remediation prioritization decisions.

The [CASCADE](@/glossary/cascade.md) pattern library provides platform-specific debt pattern recognition. The five CASCADE categories (Type Mismatch, Dead Code, Empty Check, Timer Replacement, Nuclear Cache) represent recurring debt patterns that the agent has been specifically trained to identify and classify.

## Core Capabilities

**Automated Debt Detection** scans the platform codebase using static analysis, pattern matching, and heuristic evaluation to identify instances of technical debt. Detection covers code-level debt (complex functions, duplicated logic, inadequate error handling), design-level debt (inappropriate coupling, missing abstractions, violated architectural boundaries), and quality-level debt (missing tests, incomplete type specifications, documentation gaps).

**Quantitative Debt Assessment** assigns measurable severity scores to identified debt items based on their impact on maintainability, reliability, performance, and development velocity. The scoring model considers the debt item's location (high-traffic code paths receive higher severity), age (older debt has accumulated more interest), and blast radius (debt affecting many downstream modules receives higher priority).

**Interest Rate Modeling** estimates the ongoing cost of each debt item by analyzing metrics such as defect frequency in affected areas, developer time spent on workarounds, and the cognitive load imposed on developers working in debt-affected code. High-interest debt items, those causing the most ongoing cost, are prioritized for early remediation regardless of their absolute severity.

**Remediation Planning** produces structured remediation plans that specify the scope of changes required, estimated effort, risk assessment, and recommended sequencing. Plans are designed to allow incremental debt reduction without requiring large-scale rewrites, reducing the risk of introducing new defects during remediation.

**Trend Analysis** tracks debt metrics over time to identify whether the platform's overall debt level is increasing, stable, or decreasing. Trend analysis also identifies specific areas of the codebase where debt is accumulating most rapidly, enabling proactive intervention before debt reaches critical levels.

## Architecture and Implementation

The Tech Debt Analyst is implemented as an [OTP](@/glossary/otp.md) process within the primary-producer domain, with a scan-analyze-report pipeline architecture.

| Component | Function | Implementation |
|-----------|----------|---------------|
| Code Scanner | Static analysis and pattern detection | AST analysis + Credo integration |
| Debt Classifier | Categorize detected debt by type and severity | Rule-based classification engine |
| Interest Calculator | Estimate ongoing cost of debt items | Metric correlation analysis |
| Remediation Planner | Generate prioritized remediation plans | Multi-criteria optimization |
| Trend Tracker | Monitor debt metrics over time | Time-series analysis with ETS storage |
| Report Generator | Produce structured debt assessment reports | Template-based report builder |

The code scanner operates at the AST (Abstract Syntax Tree) level, enabling deep analysis of code structure beyond what line-level pattern matching can achieve. AST analysis detects structural anti-patterns such as deeply nested conditionals, excessively long function bodies, and parameter lists that suggest missing data structures.

## Debt Classification Framework

The agent classifies technical debt along multiple dimensions that support prioritized remediation.

| Dimension | Categories | Assessment Method |
|-----------|-----------|------------------|
| Type | Code, Design, Test, Documentation, Infrastructure | Automated detection |
| Origin | Deliberate, Inadvertent, Environmental | Historical analysis |
| Severity | Critical, High, Medium, Low | Impact scoring |
| Interest Rate | High, Medium, Low | Cost modeling |
| Remediation Cost | Days, Hours, Minutes | Effort estimation |
| Blast Radius | Platform-wide, Domain, Application, Module | Dependency analysis |

The platform's current [QDP](@/glossary/qdp.md) count of zero reflects complete elimination across all categories. The agent now operates primarily in prevention mode, detecting new debt introduction before it accumulates, rather than in remediation mode.

## Integration with Quality Infrastructure

The Tech Debt Analyst integrates deeply with the platform's quality infrastructure to both detect debt and prevent its reintroduction.

The pre-commit quality protection hooks include debt checks that block commits introducing new debt patterns. The quality floor guardian monitors debt metrics continuously and escalates when debt indicators rise above their baseline values. The [SEADF](@/glossary/seadf.md) evolution framework uses debt analysis results to guide autonomous evolution toward debt-free configurations.

The [mycelial network](@/glossary/mycelial-network.md) communication pattern enables the agent to share debt intelligence across the platform, allowing domain-specific agents to understand the debt implications of changes within their areas of responsibility.

## Integration Points

| System | Integration Purpose | Data Flow |
|--------|-------------------|-----------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Agent lifecycle and task dispatch | Bidirectional |
| [Prismatic Telemetry](@/glossary/telemetry.md) | Debt metrics and detection events | Write |
| [AIAD Registry](@/glossary/registry-otp.md) | Agent specification and discovery | Read |
| [SEADF](@/glossary/seadf.md) | Quality evolution integration | Bidirectional |
| Quality Floor Guardian | Debt threshold enforcement | Bidirectional |
| Git Hooks | Pre-commit debt detection | Blocking gate |
| [Trinity Gate](@/glossary/trinity-gate.md) | Debt assessment verification | Validation |

## Operational Metrics

The agent tracks metrics that quantify the platform's debt management effectiveness. Key metrics include total debt item count (currently 0), debt introduction rate (new items per time period), mean time to remediation (how quickly detected debt is eliminated), and debt density (debt items per thousand lines of code). These metrics are reported through the platform's telemetry system and displayed on operational dashboards.

## Related Agents

The Tech Debt Analyst works in close collaboration with the [technical-debt-reduction-specialist](@/agents/technical-debt-reduction-specialist.md), which executes the remediation plans produced by the analyst. The [system-architecture-specialist](@/agents/system-architecture-specialist.md) addresses architectural-level debt identified by the analyst. The [systematic-verifier](@/agents/systematic-verifier.md) validates that debt remediation does not introduce regressions.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)