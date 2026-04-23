+++
title = "proposal-writer"
weight = 317
[extra]
domain = "primary-producer"
level = "L2"
description = "Sales proposal generation and business document creation specialist"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "seadf", "mycelial-network", "otp", "no-doubts", "telemetry", "no-mercy"]
domain_normalized = "primary"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2050
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["proposal-writer", "Sales", "agents", "agent", "Prismatic Platform", "Prismatic Perimeter", "Document"]
tags = ["agents", "agent", "proposal-writer", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "proposal-writer - Prismatic Platform"
+++

## Overview

The proposal-writer operates as an L2 Tactical Operations agent within the Prismatic Platform's primary-producer domain, specializing in automated sales proposal generation, business document creation, and structured content production for client-facing deliverables. This agent transforms raw intelligence gathered by the platform's investigation and analysis agents into polished, professional business documents that communicate findings, recommendations, and value propositions to external stakeholders. Whether producing security assessment proposals for Prismatic Perimeter prospects, due diligence reports for corporate investigations, or technical architecture documents for platform integration projects, the proposal-writer generates consistently structured, evidence-backed documents that maintain the platform's quality standards.

Built on the [AIAD](@/glossary/aiad.md) standard and governed by the [NO DOUBTS](@/glossary/no-doubts.md) principle, every document produced by this agent includes explicit source attribution for all claims, quantified confidence levels for analytical statements, and clear separation between established facts and interpretive conclusions. The agent operates as an [OTP](@/glossary/otp.md) process with access to the platform's knowledge bases, [telemetry](@/glossary/telemetry.md) data, and agent capability registry, enabling it to assemble proposals that accurately reflect the platform's current capabilities and the specific intelligence gathered for each engagement.

## Document Generation Architecture

The proposal-writer implements a template-driven generation architecture that separates document structure from content population, enabling rapid customization while maintaining consistency across all outputs.

**Template Library** maintains a curated collection of document templates organized by document type (proposal, report, assessment, executive summary), industry vertical (financial services, healthcare, technology, government), and engagement type (initial pitch, follow-up, technical deep-dive, executive briefing). Each template defines the document skeleton -- section ordering, required content blocks, formatting specifications, and compliance requirements for the target audience.

**Content Assembly Pipeline** populates templates with relevant content drawn from multiple platform sources. The pipeline queries the platform's knowledge bases for relevant facts, retrieves investigation results from completed agent workflows, extracts performance metrics from telemetry data, and synthesizes these inputs into coherent narrative sections. Each content block carries provenance metadata tracking which platform source contributed each statement.

**Quality Assurance Layer** validates every generated document against structural completeness rules (all required sections present), factual accuracy checks (all claims traceable to source data), consistency verification (no contradictory statements across sections), and readability metrics (sentence complexity, jargon density, reading level appropriateness for target audience).

## Proposal Types and Templates

The agent supports several categories of business documents, each with specialized generation logic.

**Sales Proposals** present the platform's capabilities in the context of a prospect's specific needs. The agent analyzes the prospect's industry, known challenges, regulatory requirements, and competitive landscape to select relevant capability highlights and case study references. Pricing sections are generated from configurable pricing models with engagement-specific parameters. Executive summaries are generated last, synthesizing the key value propositions identified during content assembly.

**Security Assessment Reports** document the findings of Prismatic Perimeter security evaluations. These reports follow a standardized structure: executive summary with security rating (A-F grade), detailed findings organized by severity, compliance assessment against relevant frameworks (NIS2, ZKB), risk quantification with confidence intervals, and prioritized remediation recommendations. The agent ensures that all findings are supported by specific evidence and that risk ratings follow the platform's evidence-based scoring methodology.

**Due Diligence Reports** compile investigation findings into structured documents suitable for legal and financial review. These reports maintain strict separation between verified facts and analytical interpretations, include complete provenance chains for all assertions, and flag areas where information gaps affect conclusion confidence. The [NABLA Infinity](@/glossary/nabla-infinity.md) signal plurality requirement is reflected in the report structure -- conclusions supported by multiple independent sources are distinguished from single-source findings.

**Technical Architecture Documents** describe the platform's technical implementation for integration partners and technical stakeholders. These documents are generated from the platform's own codebase metadata, API specifications, and architecture documentation, ensuring accuracy without manual documentation maintenance.

## Content Intelligence Integration

The proposal-writer draws on the platform's intelligence infrastructure to produce contextually relevant content.

**Prospect Research** leverages OSINT capabilities to gather publicly available information about target organizations -- recent press releases, financial filings, regulatory actions, technology stack indicators, and competitive positioning. This intelligence informs proposal customization, enabling the agent to reference the prospect's specific situation rather than producing generic capability descriptions.

**Competitive Positioning** maintains knowledge of competing solutions in relevant market segments (for Prismatic Perimeter: BitSight, SecurityScorecard, Black Kite) and generates comparison sections that accurately represent differentiating capabilities without misrepresenting competitor offerings.

**Regulatory Awareness** integrates current regulatory requirements into proposals, ensuring that compliance claims are accurate and that recommended solutions address the prospect's actual regulatory obligations. The agent tracks regulatory changes through the platform's compliance monitoring infrastructure and updates proposal templates accordingly.

## Formatting and Output

The proposal-writer produces documents in multiple output formats to accommodate different delivery requirements. Supported formats include Markdown (for internal review and version control), PDF (for formal delivery), HTML (for web-based presentation), and structured JSON (for integration with external document management systems). All formats maintain consistent visual identity and content structure.

Document formatting follows configurable brand guidelines including typography, color schemes, header styles, and logo placement. The agent supports multiple brand configurations for different platform product lines and can generate co-branded documents for partner engagements.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/proposal generate` | Generate a proposal from a specified template and content sources | L2+ |
| `/proposal templates` | List available templates with applicability descriptions | L2+ |
| `/proposal customize` | Modify template parameters for a specific engagement | L2+ |
| `/proposal review` | Run quality assurance checks on a generated document | L2+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [risk-assessment-commander](@/agents/risk-assessment-commander.md) | Risk findings and severity ratings for security assessment proposals |
| [opportunity-analyzer](@/agents/opportunity-analyzer.md) | Prospect qualification data for proposal prioritization |
| [regulatory-compliance-risk-specialist](@/agents/regulatory-compliance-risk-specialist.md) | Compliance requirement analysis for regulatory-focused proposals |
| [real-estate-valuation-specialist](@/agents/real-estate-valuation-specialist.md) | Property valuation data for real estate due diligence reports |

## Integration Architecture

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Runtime execution and lifecycle management |
| Prismatic Telemetry | Document generation performance [metrics](@/glossary/metrics.md) and quality tracking |
| [AIAD](@/glossary/aiad.md) [Registry](@/glossary/registry-otp.md) | Agent specification and discovery |
| [SEADF](@/glossary/seadf.md) Pipeline | Document quality assessment within content workflows |
| [Mycelial Network](@/glossary/mycelial-network.md) | Cross-agent content aggregation for multi-source proposals |

## Enforcement

All generated documents comply with the [NO MERCY](@/glossary/no-mercy.md) doctrine -- incomplete documents, documents with unsubstantiated claims, or documents that fail quality assurance checks are rejected. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires that every factual claim in a generated document is traceable to a specific platform data source with explicit confidence attribution. Documents containing security-sensitive findings pass through additional review gates before external delivery, ensuring that disclosed information is appropriate for the target audience and complies with responsible disclosure practices.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)