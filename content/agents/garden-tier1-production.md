+++
title = "garden-tier1-production"
weight = 176
[extra]
domain = "production-repositories"
level = "L3"
description = "Manages Tier 1 production-grade garden repositories including high-value OSINT and AI platform assets with continuous monitoring and integration support"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "telemetry", "ecto", "garden", "lean4"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2000
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["garden-tier1-production", "Manages", "Tier", "OSINT", "agents", "agent", "Prismatic Platform", "Production", "GARDEN"]
tags = ["agents", "agent", "garden-tier1-production", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "garden-tier1-production - Prismatic Platform"
+++

## Overview

The [Garden](/glossary/garden/) Tier 1 Production agent operates as an L3 [strategic command](/glossary/strategic-command/) agent within the Production Repositories domain of the Prismatic Platform. This agent manages the highest-value repositories in the GARDEN (Growing Autonomous Repository for Development Evolution and Navigation) ecosystem -- Tier 1 production-grade repositories that contain actively maintained, production-quality code with direct relevance to the current platform. The five core [Lean4](/glossary/lean4/) theorems guaranteeing safe evolution apply with particular rigor to Tier 1 operations, as changes to these repositories have the highest potential impact on the platform.

Within the platform's 434-agent autonomous ecosystem built on the [AIAD](/glossary/aiad/) standard, the Tier 1 Production agent occupies the most critical position in the GARDEN hierarchy. Tier 1 repositories represent code that has been battle-tested in production environments and contains accumulated domain expertise of exceptional value. The agent ensures that this value is preserved, accessible, and continuously available for platform integration.

## Tier 1 Repository Portfolio

Tier 1 repositories are distinguished from lower tiers by their production heritage, active maintenance status, and direct applicability to current platform capabilities.

The sig repository is the GARDEN's crown jewel -- a comprehensive OSINT framework containing 250+ intelligence data providers, entity resolution algorithms, data normalization pipelines, and investigation workflow support. This repository's provider integrations directly inform the Prismatic Platform's OSINT capabilities, and its entity resolution approach has been partially extracted and adapted for the platform's current [entity resolution](/glossary/entity-resolution/) engine.

The prismatic legacy repository contains the previous generation of the AI platform, with 1,302 files covering neural network architectures, training pipelines, inference optimization, and model management infrastructure. While the current platform has evolved significantly from this codebase, the legacy repository preserves design decisions, architectural insights, and domain-specific algorithms that continue to inform platform development.

| Repository | Key Assets | File Count | Primary Value |
|-----------|------------|------------|---------------|
| sig | 250+ OSINT providers, entity resolution | High | Intelligence infrastructure patterns |
| prismatic (legacy) | AI pipeline, model management | 1,302 | Architectural knowledge, algorithms |

## Production Readiness Monitoring

The Tier 1 Production agent continuously monitors repository production readiness across multiple dimensions, ensuring that high-value assets remain accessible and functional for platform integration.

Build status monitoring ensures that Tier 1 repositories compile and build successfully with their declared dependencies. Build failures are treated as priority incidents, as they may indicate dependency rot that could prevent extraction operations. The agent maintains build environment configurations that enable consistent reproduction of successful builds.

Test suite monitoring tracks the pass rate and coverage of repository test suites. Declining test health may indicate code rot or environmental drift that requires intervention. The agent distinguishes between test failures caused by code issues versus failures caused by environmental changes (deprecated APIs, removed services, updated dependencies).

Dependency security monitoring scans Tier 1 repository dependencies for known vulnerabilities, providing early warning of security issues in code that may be extracted for platform use. Critical vulnerabilities trigger immediate notification to the [gardener-supreme](/agents/gardener-supreme/) for prioritization.

## Integration Support

The Tier 1 Production agent provides specialized integration support for teams working to extract and adapt Tier 1 components for the current platform.

Component readiness assessment evaluates specific components within Tier 1 repositories for extraction readiness, including quality metrics, dependency complexity, and adaptation difficulty. This assessment helps the [garden-extractor](/agents/garden-extractor/) plan extraction operations with realistic effort estimates.

Interface documentation generates API documentation for Tier 1 repository interfaces, covering function signatures, expected behaviors, error conditions, and usage examples. This documentation supports integration planning by providing the information needed to design platform interfaces that align with or adapt existing APIs.

Migration path analysis identifies the optimal sequence for extracting and integrating Tier 1 components, accounting for interdependencies between components and the platform's current development priorities. Migration paths minimize integration risk by ordering extractions so that foundational components are integrated before dependent components.

## Knowledge Preservation

Tier 1 repositories contain accumulated knowledge that extends beyond their code contents. The agent ensures comprehensive knowledge preservation across several dimensions.

Architectural knowledge includes the design decisions, trade-offs, and rationale that shaped repository architecture. This knowledge is captured through architecture decision records, commit message analysis, and code comment extraction. Understanding why specific approaches were chosen prevents repeated learning of lessons already captured in Tier 1 code.

Domain knowledge includes the business rules, data models, and processing logic specific to intelligence platform operations. OSINT provider quirks, data format variations, rate limiting strategies, and entity resolution heuristics represent domain knowledge accumulated through production experience that would be expensive to rediscover.

Operational knowledge includes deployment procedures, configuration management approaches, monitoring strategies, and incident response patterns from production operations. This knowledge informs the current platform's operational practices and helps avoid previously encountered operational pitfalls.

## Lean4 Theorem Compliance

The five core [Lean4](/glossary/lean4/) theorems apply with particular rigor to Tier 1 repository operations.

Behavioral Preservation ensures that any extraction from Tier 1 repositories preserves the observable behavior of extracted components. Type Safety ensures that extracted code maintains type consistency when adapted for the platform. Convergence ensures that evolutionary improvements to Tier 1-derived components converge toward optimal configurations. Idempotency ensures that repeated extraction and adaptation operations produce consistent results. Rollback Safety ensures that any integration of Tier 1 components can be reversed without data loss.

## Synchronization Protocol

Tier 1 repositories receive the most frequent synchronization of any GARDEN tier, ensuring that local copies reflect upstream changes with minimal delay.

Synchronization runs every four hours for active Tier 1 repositories, with immediate synchronization available on demand. Each synchronization captures not just code changes but also issue tracker updates, pull request status, CI/CD results, and release notes.

Change impact assessment evaluates each synchronization's incoming changes for potential impact on existing extractions and integrations. Changes that affect previously extracted components trigger re-evaluation notifications to the [garden-analyzer](/agents/garden-analyzer/) and [garden-extractor](/agents/garden-extractor/).

## Quality Standards

Tier 1 repositories are held to the highest quality standards within the GARDEN, reflecting their production heritage and their importance as source material for platform integration.

Quality monitoring tracks code quality metrics including test coverage, type annotation density, documentation completeness, and dependency health. Quality trends are analyzed to detect gradual degradation that might affect extraction quality.

The [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine applies to all Tier 1 operations. No extraction from a Tier 1 repository proceeds without complete quality assessment. No integration enters the platform without full quality gate compliance.

## Epistemic Framework Compliance

The [NABLA Infinity](/glossary/nabla-infinity/) framework's Provenance Mandatory axiom requires complete traceability from platform components back to their Tier 1 origins. The Time Decay axiom ensures that Tier 1 repository assessments are periodically refreshed to reflect current states.

## Integration Architecture

| Component | Relationship | Purpose |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Runtime execution | Agent lifecycle management |
| AIAD [Registry](/glossary/registry-otp/) | Discovery | Specification and lookup |
| Prismatic Telemetry | Monitoring | Repository health metrics |
| Tier 1 Repositories | Data source | Production-grade code assets |
| Lean4 Framework | Verification | Formal evolution safety proofs |

## Related Agents

- [**gardener-supreme**](/agents/gardener-supreme/) (L3) - Strategic oversight directing Tier 1 priorities and resource allocation
- [**garden-analyzer**](/agents/garden-analyzer/) (L3) - Deep analysis providing assessments consumed for Tier 1 component evaluation
- [**garden-extractor**](/agents/garden-extractor/) (L3) - Extraction operations drawing components from Tier 1 repositories

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)