+++
title = "garden-tier2-platform"
weight = 177
[extra]
domain = "platform-core-repositories"
level = "L3"
description = "Manages Tier 2 platform core garden repositories containing foundational libraries, SDK implementations, and architectural components for knowledge transfer"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "telemetry", "ecto", "garden"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2000
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["garden-tier2-platform", "Manages", "Tier", "agents", "agent", "Prismatic Platform", "Platform", "KuzuDB"]
tags = ["agents", "agent", "garden-tier2-platform", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "garden-tier2-platform - Prismatic Platform"
+++

## Overview

The [Garden](/glossary/garden/) Tier 2 Platform agent operates as an L3 [strategic command](/glossary/strategic-command/) agent within the Platform Core Repositories domain of the Prismatic Platform. This agent manages Tier 2 garden repositories -- platform core assets that contain foundational libraries, SDK implementations, database adapters, and architectural components essential to the platform's infrastructure. While Tier 1 repositories represent production applications, Tier 2 repositories represent the building blocks from which those applications are constructed.

Within the platform's 434-agent autonomous ecosystem built on the [AIAD](/glossary/aiad/) standard, the Tier 2 Platform agent serves a bridging role between high-value production code (Tier 1) and general-purpose libraries (Tier 3). Tier 2 repositories contain platform-specific implementations that are not standalone applications but provide capabilities that multiple applications depend upon. Their management requires understanding both their technical characteristics and their dependency relationships with the broader platform.

## Tier 2 Repository Portfolio

Tier 2 repositories are characterized by their foundational role in platform architecture. Unlike Tier 1 repositories that serve end users directly, Tier 2 repositories provide capabilities consumed by other platform components.

Key Tier 2 repositories include kuzu-ex (KuzuDB Elixir SDK providing graph database integration), crisstal (data processing and transformation framework), and code-weaver (code generation and analysis tooling). Each repository contains architectural patterns and implementation approaches that have direct bearing on the current platform's design.

The kuzu-ex repository is particularly significant as it provides the Elixir bindings for KuzuDB, the graph database used throughout the platform for relationship mapping and network analysis. The patterns established in this SDK -- connection pooling strategies, query builder design, result mapping conventions -- directly inform the platform's current graph database integration layer.

| Repository | Category | Key Capabilities | Platform Relevance |
|-----------|----------|-----------------|-------------------|
| kuzu-ex | Database SDK | Graph database bindings, query DSL | Direct -- KuzuDB integration patterns |
| crisstal | Data processing | ETL pipelines, data transformation | High -- pipeline architecture patterns |
| code-weaver | Developer tooling | Code analysis, generation templates | Medium -- meta-programming patterns |

## Platform Core Management

Managing Tier 2 repositories requires attention to their role as platform infrastructure. Changes in Tier 2 repositories can cascade to multiple dependent components, making stability and compatibility primary concerns.

API stability monitoring tracks changes to public interfaces in Tier 2 repositories, flagging modifications that may break dependent components. Semantic versioning analysis determines whether changes represent breaking modifications (major version), backward-compatible additions (minor version), or bug fixes (patch version). Breaking changes trigger compatibility assessments across all known consumers.

Dependency health analysis examines the dependency graphs of Tier 2 repositories, identifying vulnerable dependencies, version conflicts with the current platform, and dependencies that have reached end-of-life status. For repositories that serve as SDKs or client libraries, dependency health directly affects the stability of platform components that consume them.

Documentation currency ensures that Tier 2 repository documentation accurately reflects current interfaces and behavior. Outdated documentation in platform core repositories creates integration risks when other agents or developers rely on documented but changed interfaces.

## Architecture Pattern Extraction

Tier 2 repositories are rich sources of architectural patterns that inform current platform design. The agent identifies and catalogs these patterns for use by the [garden-analyzer](/agents/garden-analyzer/) and [garden-pattern-scout](/agents/garden-pattern-scout/).

Connection management patterns from database SDK repositories (kuzu-ex and others) demonstrate approaches to connection pooling, health checking, retry logic, and graceful degradation. These patterns directly inform the platform's database connection management across [PostgreSQL](/glossary/postgresql/), KuzuDB, Meilisearch, and Redis adapters.

Query builder patterns from data access repositories show different approaches to constructing type-safe queries, managing query parameters, and handling result sets. Comparison across Tier 2 repositories reveals how query builder design evolved and which approaches proved most maintainable.

Pipeline architecture patterns from data processing repositories demonstrate approaches to staged data transformation, error handling within pipelines, backpressure management, and pipeline monitoring. These patterns directly inform the platform's [GenStage](/glossary/genstage/)-based processing pipelines.

## Synchronization and Maintenance

Tier 2 repositories receive daily synchronization, reflecting their active status and the importance of tracking changes that may affect platform infrastructure.

Synchronization operations capture code changes, dependency updates, release tags, and CI/CD status. The agent maintains a change log that summarizes incoming changes and highlights modifications to public interfaces that may require attention from platform integrators.

Compatibility testing runs automated checks after each synchronization to verify that Tier 2 repository code remains compatible with the current platform's dependency versions and interface expectations. Compatibility failures are reported immediately to prevent integration issues from accumulating.

Build environment maintenance ensures that Tier 2 repositories can be built and tested in environments matching the current platform's configuration. Environment drift -- where repository build requirements gradually diverge from the platform's environment -- is detected early and addressed through either repository updates or platform adaptation.

## Knowledge Transfer Facilitation

The Tier 2 Platform agent facilitates knowledge transfer from Tier 2 repositories to the current platform by maintaining transfer readiness assessments and supporting extraction operations.

Transfer readiness assessments evaluate specific components within Tier 2 repositories for extraction viability. Components with stable interfaces, comprehensive test suites, and clear documentation receive high readiness scores. Components with evolving interfaces, sparse testing, or implicit dependencies receive lower scores with specific remediation recommendations.

Integration guidance documents provide platform-specific instructions for adapting Tier 2 components to the current platform's conventions. These guides cover module naming conventions, supervision tree integration, telemetry instrumentation, and configuration management patterns specific to the Prismatic Platform's umbrella application structure.

## Quality Monitoring

Quality monitoring for Tier 2 repositories tracks metrics relevant to their role as platform infrastructure.

Test suite health is particularly important for Tier 2 repositories, as test failures may indicate interface changes that affect dependent platform components. The agent monitors test pass rates, coverage trends, and test freshness (whether tests cover current functionality).

Type safety coverage tracks the percentage of public functions with type specifications in Tier 2 repositories. For Elixir repositories, this means @spec annotations; for repositories in other languages, equivalent type annotation mechanisms. Higher type safety coverage enables more confident integration with the platform's Dialyzer-verified codebase.

## Epistemic Framework Compliance

The [NABLA Infinity](/glossary/nabla-infinity/) framework's Time Decay axiom governs the agent's assessment of Tier 2 repository currency. Repository assessments carry timestamps and are flagged for refresh on their daily synchronization schedule. The Provenance Mandatory axiom requires that all integration recommendations trace back to specific repository analysis results.

The [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine applies to all Tier 2 operations. No component is recommended for extraction without thorough quality and compatibility assessment. No integration proceeds without verification of platform standard compliance.

## Integration Architecture

| Component | Relationship | Purpose |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Runtime execution | Agent lifecycle management |
| AIAD [Registry](/glossary/registry-otp/) | Discovery | Specification and lookup |
| Prismatic Telemetry | Monitoring | Repository health and quality metrics |
| Tier 2 Repositories | Data source | Platform core code assets |
| [Ecto](/glossary/ecto/) | Data patterns | Schema and query pattern reference |

## Related Agents

- [**garden-tier1-production**](/agents/garden-tier1-production/) (L3) - Manages higher-priority production repositories with tighter monitoring cycles
- [**garden-tier3-libraries**](/agents/garden-tier3-libraries/) (L3) - Manages lower-priority library repositories with less frequent synchronization
- [**gardener-supreme**](/agents/gardener-supreme/) (L3) - Strategic oversight coordinating priorities across all GARDEN tiers

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)