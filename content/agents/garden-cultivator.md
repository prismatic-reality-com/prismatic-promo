+++
title = "Garden Cultivator"
weight = 172
[extra]
domain = "domain"
level = "L3"
description = "Handles routine garden maintenance tasks including repository synchronization, health monitoring, dependency updates, and content freshness management"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "hot-code-reload", "telemetry", "ecto", "garden"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2000
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Garden", "Cultivator", "Handles", "agents", "agent", "Prismatic Platform", "Tier", "The Cultivator"]
tags = ["agents", "agent", "garden-cultivator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Garden Cultivator - Prismatic Platform"
+++

## Overview

The [Garden](@/glossary/garden.md) Cultivator operates as an L3 [strategic command](@/glossary/strategic-command.md) agent within the Domain domain of the Prismatic Platform. This agent handles routine garden maintenance tasks essential for keeping the 116-repository GARDEN (Growing Autonomous Repository for Development Evolution and Navigation) ecosystem healthy, synchronized, and ready for analysis and extraction operations. Repository synchronization, health monitoring, dependency tracking, and content freshness management all fall within the Cultivator's operational mandate.

Within the platform's 434-agent autonomous ecosystem built on the [AIAD](@/glossary/aiad.md) standard, the Garden Cultivator serves as the operational maintenance backbone of the GARDEN subsystem. While strategic agents like the [gardener-supreme](@/agents/gardener-supreme.md) set priorities and analytical agents like the [garden-analyzer](@/agents/garden-analyzer.md) evaluate repository value, the Cultivator performs the continuous maintenance work that keeps the garden infrastructure functional and current.

## Repository Synchronization

Repository synchronization ensures that the platform's local copies of garden repositories remain current with their upstream sources. The 116 repositories in the GARDEN span multiple hosting platforms (GitHub, GitLab, Bitbucket) and may receive updates from external contributors, automated processes, or archived state changes.

The synchronization process operates on a tiered schedule aligned with the GARDEN tier classification system. Tier 1 (Production) repositories such as sig (OSINT framework) and prismatic (AI platform) receive frequent synchronization due to their active development status and high value to the platform. Tier 2 (Platform Core) repositories receive regular synchronization on a daily basis. Tier 3 (Libraries) repositories are synchronized weekly. Tier 4 (Archive) repositories receive monthly synchronization checks, and Tier 5 (R&D) repositories are synchronized on demand.

| Tier | Repository Count | Sync Frequency | Priority |
|------|-----------------|----------------|----------|
| T1 Production | 2 | Every 4 hours | Critical |
| T2 Platform Core | 5 | Daily | High |
| T3 Libraries | 15 | Weekly | Medium |
| T4 Archive | 80+ | Monthly | Low |
| T5 R&D | 14 | On demand | Variable |

Synchronization includes not just code updates but also metadata updates: issue tracker status, pull request states, CI/CD results, and dependency declaration changes. This comprehensive synchronization ensures that analytical agents have complete context when evaluating repository status.

Conflict resolution handles cases where local modifications (annotations, analysis metadata, integration patches) conflict with upstream changes. The Cultivator maintains a separation between upstream content and platform-added metadata, enabling clean merges in most cases. When conflicts require manual resolution, the Cultivator generates conflict reports with sufficient context for the [gardener-supreme](@/agents/gardener-supreme.md) to make resolution decisions.

## Health Monitoring

Health monitoring continuously assesses the operational status of garden repositories across multiple health dimensions.

Build health tracks whether repositories can be built successfully with their declared dependencies. Many garden repositories use outdated dependency versions or build systems that require specific environment configurations. The Cultivator maintains build status records and identifies repositories whose build health has changed, enabling proactive attention before build failures block extraction operations.

Dependency health monitors the security and maintenance status of repository dependencies. Vulnerable dependencies are flagged immediately, unmaintained dependencies are tracked for future risk, and dependency version conflicts between repositories are recorded for integration planning.

Documentation health assesses the completeness and accuracy of repository documentation. README files, API documentation, configuration guides, and architecture notes are evaluated for currency and completeness. Documentation health scores inform the [garden-analyzer](@/agents/garden-analyzer.md)'s repository assessments.

Test health evaluates the status of repository test suites. Test pass rates, coverage metrics, and test freshness (whether tests exercise current functionality) provide indicators of code reliability and maintainability.

## Content Freshness Management

Content freshness management tracks the temporal relevance of repository contents, distinguishing between actively maintained code, stable-but-current code, and stale code that may require updating before use.

Freshness assessment considers multiple temporal signals: last commit date, last dependency update, last CI/CD execution, and last issue or pull request activity. These signals combine into a freshness score that ranges from "actively maintained" to "archived" to "abandoned."

Stale content identification flags repositories and specific modules whose content has aged beyond configured thresholds without review. Stale content is not automatically removed -- the platform's preservation-oriented approach values historical code -- but it is annotated to prevent analysts from treating outdated patterns as current best practices.

Relevance decay tracking monitors how platform evolution affects the relevance of garden repositories. As the platform adopts new patterns and technologies, repositories implementing superseded approaches decrease in direct relevance while potentially increasing in historical value. The Cultivator tracks this decay and updates relevance scores accordingly.

## Dependency Tracking

Dependency tracking maps the dependency relationships both within the garden ecosystem and between garden repositories and the current platform.

Internal dependency mapping identifies which garden repositories depend on other garden repositories, revealing clusters of related projects and identifying integration ordering constraints. For example, if three garden repositories all depend on a shared utility library, that library must be evaluated and potentially integrated before the dependent repositories.

Platform dependency mapping identifies shared dependencies between garden repositories and the current platform. Shared dependencies simplify integration (common code is already present) while conflicting dependency versions complicate it (version reconciliation required). The Cultivator maintains a comprehensive dependency matrix that enables rapid assessment of integration compatibility.

Transitive dependency analysis follows dependency chains to their roots, identifying cases where garden repositories indirectly depend on components that are incompatible with the current platform. Early identification of transitive conflicts prevents wasted effort on integration attempts that would fail at runtime.

## Automated Maintenance Tasks

The Cultivator executes several categories of automated maintenance tasks that keep the garden infrastructure operational without requiring manual intervention.

Index maintenance updates the searchable indexes that other GARDEN agents use to locate repositories, patterns, and code components. Indexes are rebuilt when repository contents change, ensuring that search results reflect current repository states.

Cache management maintains cached analysis results from the [garden-analyzer](@/agents/garden-analyzer.md), invalidating cached entries when underlying repository contents change and triggering re-analysis as needed. Cache management balances analysis freshness against computational cost, avoiding unnecessary re-analysis of unchanged content.

Storage optimization manages the disk space consumed by 116 repositories and their associated analysis artifacts. Large binary files, obsolete build artifacts, and redundant cached data are identified for cleanup while preserving all content with potential analytical or historical value.

## Operational Telemetry

The Cultivator publishes detailed telemetry events for all maintenance operations, enabling monitoring and performance optimization of the GARDEN infrastructure.

Synchronization telemetry tracks sync duration, data volume transferred, conflict counts, and failure rates by repository tier. This data enables detection of upstream changes that may indicate significant repository activity requiring analyst attention.

Health monitoring telemetry records health assessment results over time, enabling trend analysis that identifies repositories experiencing gradual degradation versus sudden health changes.

## Epistemic Framework Compliance

The [NABLA Infinity](@/glossary/nabla-infinity.md) framework's Time Decay axiom directly governs the Cultivator's content freshness management. All content assessments carry timestamps, and content-based decisions respect temporal validity windows. The Provenance Mandatory axiom requires that maintenance actions are traceable to their triggering conditions and execution results.

## Integration Architecture

| Component | Relationship | Purpose |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Runtime | Agent lifecycle management |
| AIAD [Registry](@/glossary/registry-otp.md) | Discovery | Agent specification and lookup |
| Prismatic Telemetry | Monitoring | Maintenance operation tracking |
| GARDEN Repositories | Data target | 116 repositories under maintenance |
| [Ecto](@/glossary/ecto.md) | Data access | Maintenance metadata persistence |

## Related Agents

- [**gardener-supreme**](@/agents/gardener-supreme.md) (L3) - Strategic oversight directing the Cultivator's maintenance priorities
- [**garden-analyzer**](@/agents/garden-analyzer.md) (L3) - Analytical assessment consuming Cultivator health and freshness data
- [**garden-explorer-agent**](@/agents/garden-explorer-agent.md) (L3) - Navigation capabilities operating on synchronized and maintained repository content

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)