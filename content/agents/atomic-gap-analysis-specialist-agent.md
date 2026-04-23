+++
title = "Atomic Gap Analysis Specialist Agent"
weight = 41
[extra]
domain = "osint"
level = "L3"
description = "SUPREME Gap Analysis Mission for identifying and closing operational coverage gaps across platform domains"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "color-teams", "telemetry", "ecto", "kuzudb", "osint", "entity-resolution"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1950
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Atomic", "Gap", "Analysis", "Specialist", "Agent", "SUPREME", "Mission", "agents", "Prismatic Platform", "OSINT"]
tags = ["agents", "agent", "atomic-gap-analysis-specialist-agent", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Atomic Gap Analysis Specialist Agent - Prismatic Platform"
+++

## Overview

The Atomic Gap Analysis Specialist Agent is an L3 [strategic command](@/glossary/strategic-command.md) agent responsible for identifying and closing operational coverage gaps across all domains of the Prismatic Platform. Operating under the SUPREME Gap Analysis Mission designation, this agent systematically decomposes platform capabilities into atomic units and evaluates each unit for completeness, correctness, and coverage depth. When gaps are found, the agent produces structured remediation plans with prioritized action items.

In a platform spanning 90 [umbrella application](@/glossary/umbrella-application.md)s, 430+ autonomous agents, and 210+ commands, coverage gaps are inevitable unless actively hunted. A missing [OSINT](@/glossary/osint.md) provider for a critical data source, an untested edge case in [entity resolution](@/glossary/entity-resolution.md), or a compliance framework without automated validation -- each represents an atomic gap that degrades the platform's overall operational completeness. The Atomic Gap Analysis Specialist applies systematic decomposition to transform vague concerns about completeness into precise, actionable gap inventories.

The agent's methodology is grounded in the [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework, treating absence as informative data rather than noise. A missing capability is not simply "not yet built" -- it represents a specific failure mode that must be documented, scored for impact, and scheduled for remediation with the same rigor applied to bug fixes.

## Operational Domain

The Atomic Gap Analysis Specialist operates across multiple domains including OSINT intelligence, storage infrastructure, presales operations, and MCP (Model Context Protocol) integration. This cross-domain mandate enables the agent to detect gaps that exist at domain boundaries -- coverage holes that individual domain agents cannot see because they fall between jurisdictions.

The agent maintains a comprehensive capability map that represents every documented platform capability as an atomic unit with defined inputs, outputs, quality criteria, and test coverage status. This map is continuously updated as the platform evolves, ensuring that gap analysis reflects the current state of the codebase rather than stale documentation.

## Key Capabilities

- **Atomic decomposition** breaking complex platform capabilities into indivisible units that can be individually assessed for completeness, producing a structured capability tree where every leaf node has measurable quality criteria

- **Multi-registry data collection** across Czech, EU, and global sources including ARES, Justice.cz, ISIR, and CUZK integration, with gap detection for missing registry adapters or incomplete data field coverage within existing adapters

- **[Entity resolution](@/capabilities/intelligence-synthesis.md) gap detection** evaluating cross-reference validation and deduplication pipelines for scenarios where entity matching fails, including edge cases in name normalization, address parsing, and identifier format variations

- **Coverage matrix generation** producing structured matrices that map capabilities against test coverage, documentation status, error handling completeness, and production usage patterns to reveal systematic coverage weaknesses

- **Impact-weighted prioritization** scoring detected gaps by their operational impact, using factors including user-facing visibility, compliance requirements, security implications, and frequency of related support issues

- **Remediation plan synthesis** generating structured action plans for closing identified gaps, with estimated effort, required expertise, dependency chains, and recommended implementation sequence

## Gap Analysis Methodology

The Atomic Gap Analysis Specialist follows a five-phase methodology that produces reproducible, evidence-based gap assessments.

**Phase 1: Capability Enumeration.** The agent traverses the platform's module structure, AIAD agent specifications, command registry, and OSINT provider catalog to build a comprehensive capability inventory. Each capability is decomposed into atomic units -- the smallest independently testable functionality elements.

**Phase 2: Coverage Assessment.** Each atomic capability unit is evaluated against multiple coverage dimensions: test coverage (unit, integration, property-based), documentation coverage (API docs, usage examples, error descriptions), error handling coverage (all failure modes documented and handled), and production validation (evidence of real-world usage and correctness).

**Phase 3: Gap Identification.** Capability units that fall below threshold on any coverage dimension are classified as gaps. Gaps are categorized by type: missing capability (no implementation), incomplete capability (partial implementation), untested capability (implementation exists but lacks verification), and undocumented capability (implementation and tests exist but documentation is absent or outdated).

**Phase 4: Impact Scoring.** Each identified gap receives a multi-factor impact score combining operational severity (how much the gap affects platform function), compliance risk (whether the gap creates regulatory exposure), security exposure (whether the gap creates attack surface), and frequency (how often the gap affects operations).

**Phase 5: Remediation Planning.** Gaps are grouped into remediation campaigns ordered by impact score. Each campaign includes specific tasks, effort estimates, skill requirements, and dependency relationships. The output is a structured remediation backlog ready for execution by domain-specific agents.

## Cross-Domain Gap Detection

The agent's cross-domain mandate enables detection of gap patterns that emerge at domain boundaries. These include:

| Gap Pattern | Description | Example |
|------------|-------------|---------|
| Interface gap | Two domains expect different data formats at their boundary | OSINT output schema incompatible with Storage adapter input |
| Coverage asymmetry | One domain thoroughly tested while its counterpart is not | Entity resolution tested for Czech registries but not EU sources |
| Documentation gap | Cross-domain workflows documented separately with missing handoff details | Due diligence pipeline documented per-stage but not end-to-end |
| Error propagation gap | Error handling defined within domains but not for cross-domain failures | Storage failure during OSINT enrichment produces unhandled error |

## Integration Ecosystem

| Component | Relationship | Data Flow |
|-----------|-------------|-----------|
| Czech Registries | ARES, Justice.cz, ISIR, CUZK integration | Coverage analysis of registry adapter completeness |
| Prismatic OSINT | Provider orchestration and data collection | Gap detection across 121+ OSINT providers |
| [KuzuDB](@/glossary/kuzudb.md) | Graph-based entity relationship storage | Relationship coverage and query completeness analysis |
| [AIAD](@/glossary/aiad.md) Registry | Agent specification and discovery | Agent capability coverage assessment |
| [Quality Gates](@/glossary/quality-gates.md) | Static analysis and test enforcement | Gap findings feed into quality gate decisions |
| [Telemetry](@/glossary/telemetry.md) Infrastructure | Performance and event tracking | Production usage data for coverage validation |

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination and specialized operational command with authority to flag coverage gaps, request remediation from domain specialists, and escalate critical gaps to supreme authority.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [cross-domain-quality-propagator](@/agents/cross-domain-quality-propagator.md) | Quality Propagation | Ensures gap remediation standards propagate across all domains |
| [architecture-review-specialist](@/agents/architecture-review-specialist.md) | Structural Analysis | Provides architectural context for domain boundary gaps |
| [cascade-quality-specialist](@/agents/cascade-quality-specialist.md) | Pattern Quality | Coordinates CASCADE pattern gaps with broader coverage analysis |

## Performance Metrics

Gap analysis effectiveness is measured through quantitative coverage indicators.

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| Atomic units cataloged | 12,000+ | Growing | Total capability units in the coverage map |
| Gap detection rate | > 95% | > 95% | Percentage of actual gaps detected by analysis |
| Remediation completion | > 90% | > 95% | Percentage of identified gaps with completed remediation |
| False positive rate | < 5% | < 5% | Percentage of flagged gaps that are actually covered |
| Assessment cycle time | < 4 hours | < 6 hours | Time for complete platform gap analysis sweep |

## Enforcement

All gap analysis operations are governed by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. Identified gaps are not suggestions -- they are mandatory remediation targets with assigned priority and deadline. Critical gaps (security exposure, compliance risk) block deployment until resolved. The NABLA Absence Informative axiom is the foundational principle: what is missing matters as much as what is present, and missing coverage is treated as actionable intelligence rather than background noise. Every gap finding must include verifiable evidence, impact assessment, and remediation path before being published.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)