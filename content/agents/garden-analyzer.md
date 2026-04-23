+++
title = "garden-analyzer"
weight = 171
[extra]
domain = "general"
level = "L3"
description = "Specialized agent for deep analysis of garden repositories, pattern detection, and architecture assessment for intelligent knowledge transfer"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "telemetry", "ecto", "garden", "3nl"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2050
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["garden-analyzer", "Specialized", "agents", "agent", "Prismatic Platform", "Analyzer", "Garden Analyzer", "The Garden", "Data"]
tags = ["agents", "agent", "garden-analyzer", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "garden-analyzer - Prismatic Platform"
+++

## Overview

The [Garden](/glossary/garden/) Analyzer operates as an L3 [strategic command](/glossary/strategic-command/) agent within the General domain of the Prismatic Platform. This agent performs deep analysis of garden repositories -- the platform's collection of 116 legacy and reference repositories spanning over 20 years of development history -- to detect reusable patterns, assess architectural approaches, and evaluate knowledge transfer opportunities. The Garden Analyzer transforms raw repository contents into structured analytical intelligence that guides the platform's evolutionary development.

Within the platform's 434-agent autonomous ecosystem built on the [AIAD](/glossary/aiad/) standard, the Garden Analyzer provides the analytical foundation for the entire GARDEN (Growing Autonomous Repository for Development Evolution and Navigation) subsystem. While the [garden-explorer-agent](/agents/garden-explorer-agent/) navigates repository structures and the [garden-extractor](/agents/garden-extractor/) pulls specific components for integration, the Garden Analyzer produces the comprehensive assessments that determine which repositories, patterns, and code components merit attention.

## Repository Analysis Methodology

The Garden Analyzer applies a multi-dimensional analysis methodology that evaluates repositories across technical, architectural, and knowledge dimensions. This structured approach prevents the common failure mode of legacy code review: focusing exclusively on surface-level characteristics while missing deeper patterns and principles.

Technical analysis examines code quality metrics including test coverage, documentation density, type annotation coverage, and dependency health. These metrics establish baseline quality assessments that determine whether repository code can be directly reused or requires significant adaptation before integration.

Architectural analysis examines higher-level design decisions including module organization patterns, dependency structures, API design conventions, error handling strategies, and concurrency models. Architectural patterns often transfer more effectively than specific code implementations, as they encode design principles that remain relevant even when implementation technologies change.

Knowledge analysis identifies domain expertise embedded in repository code. OSINT provider integrations, data processing pipelines, entity resolution algorithms, and analytical techniques all represent accumulated domain knowledge that may not be documented externally. The Garden Analyzer extracts this implicit knowledge and catalogs it for platform integration.

## Pattern Detection Engine

The Pattern Detection Engine represents the Garden Analyzer's most sophisticated analytical capability. It identifies recurring patterns across the 116 garden repositories, classifying them by category, frequency, and adaptation complexity.

Structural patterns describe how code is organized at the file, module, and project levels. Common structural patterns discovered across garden repositories include hub-and-spoke module organization, layered architecture with strict dependency direction, plugin-based extension mechanisms, and configuration-driven behavior selection.

Behavioral patterns describe how code operates at runtime. These include event-driven processing pipelines, retry-with-backoff error recovery, circuit breaker patterns for external service integration, and producer-consumer data flow architectures. Behavioral patterns from garden repositories often map directly to [OTP](/glossary/otp/) patterns in the current platform, enabling translation from imperative implementations to functional equivalents.

Data patterns describe how information is structured, stored, and accessed. Entity representation patterns, relationship modeling approaches, temporal data handling conventions, and schema evolution strategies all fall into this category. Data patterns from the garden's JavaScript, Python, and Rust repositories inform the platform's [Ecto](/glossary/ecto/) schema design and query optimization strategies.

| Pattern Category | Repositories Analyzed | Patterns Identified | Direct Applicability |
|-----------------|----------------------|--------------------|--------------------|
| Structural | 116 | 55+ | High -- many map to OTP patterns |
| Behavioral | 116 | 35+ | Medium -- requires functional translation |
| Data | 80+ | 25+ | High -- schema patterns transfer well |
| Integration | 60+ | 20+ | Medium -- API patterns need adaptation |

## Architecture Assessment Framework

The architecture assessment framework evaluates garden repository architectures against the current platform's standards and identifies components that align with or diverge from target architecture patterns.

Alignment analysis measures how closely a repository's architecture matches the Prismatic Platform's architectural principles: functional purity with side effects at edges, process-per-entity state management, supervision tree fault tolerance, and message-passing communication. High-alignment repositories yield code that can be integrated with minimal transformation.

Divergence analysis identifies architectural decisions in garden repositories that conflict with platform principles. These divergences are not necessarily defects -- they may represent valid alternative approaches -- but they require explicit handling during integration. Common divergences include shared mutable state (requiring translation to process-isolated state), synchronous blocking I/O (requiring conversion to asynchronous patterns), and inheritance hierarchies (requiring replacement with composition and behaviors).

Evolution potential analysis assesses whether a repository's architecture supports the platform's evolutionary development methodology. Repositories with modular architectures, clear interfaces, and comprehensive test suites have high evolution potential and can be incrementally modernized. Monolithic repositories with tight coupling and limited testing require more aggressive refactoring before their value can be extracted.

## Cross-Repository Intelligence

The Garden Analyzer performs cross-repository analysis that reveals patterns and relationships not visible when examining repositories in isolation.

Technology evolution tracking traces how specific technologies and approaches evolved across repositories over time. For example, the progression from callback-based asynchronous JavaScript in early repositories to Promise-based patterns in middle-era repositories to async/await in recent repositories reveals design principle evolution that informs current platform decisions.

Shared knowledge identification finds implementations of similar functionality across different repositories, comparing approaches and identifying which implementations are most mature, best tested, or most architecturally sound. When three different garden repositories implement entity resolution algorithms, the analyzer compares their approaches to identify the strongest implementation for platform integration.

Dependency analysis maps the dependency relationships between garden repositories, identifying shared libraries, forked projects, and component reuse patterns. This dependency map reveals which repositories form natural clusters and suggests integration ordering that minimizes dependency conflicts.

## Integration with GARDEN Ecosystem

The Garden Analyzer feeds its analytical outputs to other GARDEN agents through structured intelligence products.

Repository assessments provide comprehensive evaluations consumed by the [gardener-supreme](/agents/gardener-supreme/) for strategic prioritization decisions. Pattern catalogs are consumed by the [garden-pattern-scout](/agents/garden-pattern-scout/) for targeted pattern matching against current platform needs. Extraction recommendations guide the [garden-extractor](/agents/garden-extractor/) in selecting specific components for integration, including adaptation requirements and quality prerequisites.

| Consumer Agent | Intelligence Product | Update Frequency |
|---------------|---------------------|-----------------|
| [gardener-supreme](/agents/gardener-supreme/) | Repository priority assessments | On repository changes |
| [garden-pattern-scout](/agents/garden-pattern-scout/) | Pattern catalogs with metadata | Weekly refresh |
| [garden-extractor](/agents/garden-extractor/) | Extraction recommendations | On demand |
| [garden-cultivator](/agents/garden-cultivator/) | Health and maintenance reports | Daily |

## Epistemic Framework Compliance

The [NABLA Infinity](/glossary/nabla-infinity/) framework governs the Garden Analyzer's analytical practices. The Contradiction Preservation axiom is particularly relevant when different repositories implement conflicting approaches to the same problem. The analyzer preserves both approaches and documents the trade-offs rather than prematurely selecting a winner.

The Provenance Mandatory axiom requires that all analytical conclusions trace back to specific repository evidence. Pattern claims must cite the repositories where the pattern appears, assessment scores must document the metrics that produced them, and recommendations must reference the analysis that supports them.

## Integration Architecture

| Component | Relationship | Purpose |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Runtime execution | Agent lifecycle and scheduling |
| AIAD [Registry](/glossary/registry-otp/) | Discovery | Agent specification and indexing |
| Prismatic Telemetry | Monitoring | Analysis performance metrics |
| GARDEN Repositories | Data source | 116 legacy repositories for analysis |
| [3NL](/glossary/three-nl/) Framework | Cognitive | Multi-layer reasoning for code understanding |

## Related Agents

- [**garden-explorer-agent**](/agents/garden-explorer-agent/) (L3) - Navigates repository structures providing the raw exploration data that the analyzer processes
- [**garden-extractor**](/agents/garden-extractor/) (L3) - Extracts specific components based on the analyzer's recommendations
- [**garden-pattern-scout**](/agents/garden-pattern-scout/) (L3) - Scouts for specific patterns using the analyzer's pattern catalogs as a reference

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)