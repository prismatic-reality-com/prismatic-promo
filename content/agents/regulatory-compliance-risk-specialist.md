+++
title = "regulatory-compliance-risk-specialist"
weight = 349
[extra]
domain = "regulatory"
level = "L3"
description = "Compliance risk assessment across NIS2, ZKB, GDPR, and sector-specific regulatory frameworks"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["nis2", "zkb", "no-mercy", "no-doubts", "trinity-gate", "aiad", "attack-surface", "seadf", "telemetry", "osint"]
domain_normalized = "compliance"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2200
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["regulatory-compliance-risk-specialist", "Compliance", "NIS2", "GDPR", "agents", "agent", "Prismatic Platform", "Article"]
tags = ["agents", "agent", "regulatory-compliance-risk-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "regulatory-compliance-risk-specialist - Prismatic Platform"
+++

## Overview

The regulatory-compliance-risk-specialist operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's regulatory domain, dedicated to assessing and quantifying compliance risk exposure against applicable regulatory frameworks. This agent evaluates entity compliance posture across jurisdictional requirements including the [NIS2](@/glossary/nis2.md) Directive (EU 2022/2555 on network and information security), [ZKB](@/glossary/zkb.md) 264/2025 Sb. (Czech cybersecurity regulation), [GDPR](@/glossary/gdpr.md) data protection requirements, and industry-specific regulatory mandates. Its outputs quantify the gap between current compliance state and regulatory requirements, producing actionable intelligence that enables proactive compliance management.

Built on the [AIAD](@/glossary/aiad.md) standard and governed by the [NO DOUBTS](@/glossary/no-doubts.md) principle, this agent produces compliance risk assessments backed by regulatory text analysis, control mapping evidence, and gap identification data. Every compliance determination carries explicit references to specific regulatory provisions, and all [risk score](@/glossary/risk-score.md)s include confidence intervals reflecting assessment coverage completeness. The [NABLA Infinity](@/glossary/nabla-infinity.md) framework's provenance axiom ensures that every compliance claim traces back to its regulatory source.

In the evolving European regulatory landscape, compliance risk assessment requires continuous monitoring and re-evaluation. The transposition of EU directives like NIS2 into national legislation across member states creates a complex web of overlapping requirements with jurisdictional variations. This agent navigates this complexity by maintaining structured mappings between regulatory frameworks and translating abstract regulatory requirements into assessable compliance controls.

## Operational Domain

The regulatory compliance domain covers regulatory framework mapping, control gap analysis, compliance risk quantification, and remediation priority assessment across multiple jurisdictions. The agent maintains current regulatory requirement databases for supported frameworks, tracking regulatory updates and enforcement precedents that affect compliance interpretations. Compliance assessments produce structured gap reports with risk-weighted remediation recommendations.

The agent's multi-framework approach recognizes that entities typically face simultaneous compliance obligations under multiple regulatory regimes. Rather than assessing each framework independently, the agent identifies overlapping requirements that can be satisfied by shared controls, as well as unique requirements that demand framework-specific compliance measures. This integrated approach reduces compliance burden while ensuring comprehensive coverage.

## Key Capabilities

- **Multi-framework compliance assessment** -- Evaluates entity compliance posture against multiple regulatory frameworks simultaneously, including NIS2, ZKB, GDPR, and sector-specific regulations, identifying overlapping and unique requirements
- **Control gap analysis** -- Maps existing security and operational controls against regulatory requirements, identifying specific gaps where current practices fall short of compliance obligations
- **Compliance risk scoring** -- Quantifies compliance risk exposure using weighted models that account for violation severity, enforcement likelihood, financial penalty exposure, and reputational impact
- **Regulatory change monitoring** -- Tracks regulatory updates, enforcement actions, and interpretive guidance that affect compliance obligations, flagging changes that require assessment updates
- **Remediation prioritization** -- Ranks compliance gaps by risk-weighted priority, considering enforcement probability, penalty magnitude, and remediation implementation complexity to optimize compliance investment
- **Cross-framework requirement mapping** -- Identifies shared requirements across regulatory frameworks, enabling control consolidation and reducing redundant compliance effort
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with triggered compliance re-assessment when regulatory changes are detected
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** for compliance assessment pipeline monitoring and coverage tracking

## Regulatory Framework Coverage

The agent maintains detailed requirement databases for each supported regulatory framework. **NIS2** (EU 2022/2555) coverage includes risk management measures (Article 21), incident reporting obligations (Article 23), governance requirements (Article 20), and supply chain security (Article 21.2.d). Assessment evaluates compliance across the directive's four pillars: governance, risk management, incident handling, and business continuity.

**ZKB** (264/2025 Sb.) coverage addresses Czech-specific cybersecurity requirements including critical infrastructure protection, information system classification, security measure implementation, and incident reporting to NUKIB (National Cyber and Information Security Agency). Assessment maps ZKB requirements against the entity's information system classification and applicable security measures.

**GDPR** coverage evaluates data protection compliance across processing lawfulness (Article 6), data subject rights (Articles 15-22), data protection by design (Article 25), data breach notification (Article 33), and data protection impact assessment (Article 35). Assessment identifies specific processing activities that create compliance exposure.

## Authority Level

**L3** - Strategic Command - Multi-domain coordination with authority to initiate compliance assessments, publish risk evaluations, and coordinate cross-framework compliance analysis.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/compliance assess` | Initiate compliance assessment against specified regulatory frameworks | L3+ |
| `/compliance gaps` | Display identified compliance gaps with remediation priorities | L3+ |
| `/compliance monitor` | Configure regulatory change monitoring for relevant jurisdictions | L3+ |
| `/compliance map` | Display cross-framework requirement mapping for a specified entity | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [regulatory-intelligence-commander](@/agents/regulatory-intelligence-commander.md) | Receives regulatory landscape intelligence for compliance context |
| [risk-assessment-commander](@/agents/risk-assessment-commander.md) | Compliance risk scores feed into aggregate risk assessment models |
| [regional-court-specialist](@/agents/regional-court-specialist.md) | Court enforcement data informs compliance risk assessment |
| [report-synthesis-specialist](@/agents/report-synthesis-specialist.md) | Compliance assessments are integrated into comprehensive intelligence reports |

## Assessment Methodology

Compliance assessments follow a structured methodology ensuring consistency and completeness. The **scoping phase** determines which regulatory frameworks apply to the entity based on jurisdiction, industry sector, entity size, and activities. The **mapping phase** translates applicable regulatory requirements into assessable controls, using the agent's requirement database to convert abstract regulatory language into specific compliance criteria.

The **evidence collection phase** gathers available information about the entity's current compliance posture through OSINT collection, self-reported data, and cross-reference with existing entity profiles. The **gap analysis phase** compares gathered evidence against mapped requirements, identifying specific gaps with severity and remediation complexity assessments. The **scoring phase** produces quantified compliance risk scores with confidence intervals reflecting evidence completeness.

## Enforcement

Compliance assessments are held to the highest standard under the [NO MERCY](@/glossary/no-mercy.md) doctrine: no assessment is published without complete regulatory citation, gap evidence, and confidence qualification. The [Trinity Gate](@/glossary/trinity-gate.md) validates all compliance determinations before they enter decision-support workflows. The [NABLA Infinity](@/glossary/nabla-infinity.md) framework ensures that compliance claims are traceable, and contradictory compliance signals between frameworks are preserved rather than editorially resolved.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)