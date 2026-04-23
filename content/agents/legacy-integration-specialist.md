+++
title = "legacy-integration-specialist"
weight = 216
[extra]
domain = "integration"
level = "L3"
description = "Legacy system integration patterns, adapter design, and modernization strategies for bridging heritage systems with the Prismatic Platform"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "seadf", "telemetry", "garden", "genserver", "ecto"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["legacy-integration-specialist", "Legacy", "Prismatic", "Platform", "agents", "agent", "Prismatic Platform", "GARDEN", "Level"]
tags = ["agents", "agent", "legacy-integration-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "legacy-integration-specialist - Prismatic Platform"
+++

## Overview

The legacy-integration-specialist is an L3 [Strategic Command](@/glossary/strategic-command.md) agent operating within the integration domain of the Prismatic Platform. This agent specializes in designing, implementing, and maintaining integration patterns that bridge legacy systems with the platform's modern OTP-based architecture. It encompasses adapter design, protocol translation, data migration strategies, and incremental modernization approaches that enable organizations to leverage the Prismatic Platform's capabilities without requiring wholesale replacement of existing infrastructure.

Built on the [AIAD](@/glossary/aiad.md) standard, the legacy-integration-specialist addresses one of the most persistent challenges in enterprise intelligence platforms: the need to interoperate with existing systems that cannot be immediately replaced. Legacy systems often contain years of accumulated data, implement critical business processes, and have organizational dependencies that make rapid replacement impractical. The specialist designs integration architectures that extract value from legacy systems while progressively migrating capability to the Prismatic Platform, following the Strangler Fig pattern of incremental modernization.

## Integration Architecture Patterns

The legacy-integration-specialist applies several proven architectural patterns for system integration, selecting and combining patterns based on the characteristics of the legacy system and the integration requirements.

The **Adapter Pattern** creates a translation layer between the legacy system's interface and the Prismatic Platform's expected interface. Adapters handle protocol translation (REST to gRPC, SOAP to JSON, file-based to streaming), data format conversion (XML to Elixir maps, CSV to structured records, proprietary formats to platform schemas), and semantic mapping (legacy field names to platform terminology, legacy status codes to platform enums). Adapters are implemented as [OTP](@/glossary/otp.md) GenServers that maintain connection state and handle reconnection logic for unreliable legacy endpoints.

The **Anti-Corruption Layer** protects the platform's domain model from contamination by legacy system concepts. When a legacy system uses terminology, data structures, or business rules that conflict with the platform's design, the anti-corruption layer translates between the two conceptual models. This ensures that legacy integration does not force compromises in the platform's clean architecture.

The **Event Sourcing Bridge** captures changes in legacy systems as events that flow into the platform's event processing pipeline. For legacy systems that do not natively support event emission, the bridge implements change data capture (CDC) techniques including database log tailing, polling-based change detection, and file system monitoring.

The **Data Migration Pipeline** implements staged data migration from legacy storage to platform storage. Migrations are designed to be incremental (processing data in batches), resumable (tracking migration progress for recovery from interruptions), and verifiable (comparing source and target data for consistency after migration).

## Key Capabilities

- **Legacy protocol adaptation** -- Translates between legacy communication protocols (SOAP, XML-RPC, FTP, file drops, proprietary TCP/IP) and the platform's modern interfaces ([OTP](@/glossary/otp.md) message passing, REST, gRPC, WebSocket)
- **Data format conversion** -- Converts between legacy data formats and platform schemas with configurable field mapping, type coercion, and default value handling
- **Incremental modernization planning** -- Designs phased migration strategies that progressively transfer capability from legacy systems to the platform while maintaining operational continuity
- **Change data capture** -- Implements CDC mechanisms for legacy systems that lack native event emission, enabling real-time data synchronization without modifying legacy system code
- **Connection resilience** -- Manages connections to legacy systems with automatic reconnection, circuit breaker patterns, and graceful degradation when legacy systems are unavailable
- **Data consistency verification** -- Validates data integrity during and after migration by comparing source and target data at configurable granularity levels
- **[GARDEN](@/glossary/garden.md) repository integration** -- Leverages patterns from the platform's 22-repository legacy knowledge base for proven integration approaches
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with self-healing connection management
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** for integration health monitoring and performance tracking

## GARDEN Legacy Knowledge

The legacy-integration-specialist draws on the [GARDEN](@/glossary/garden.md) (legacy knowledge repository), which contains 22 repositories with over 3,050 files representing 20+ years of accumulated integration experience. The GARDEN repositories include proven integration patterns for OSINT data providers (250+ provider adapters), database migration scripts, protocol translation utilities, and data normalization routines. These patterns have been battle-tested across multiple system generations and provide a foundation of reliable integration approaches.

Key GARDEN assets relevant to legacy integration include the Sig repository's OSINT provider adapter library (Tier 1 production grade), the Prismatic Legacy repository's 1,302 files of historical integration code (Tier 4 archive), and the Code Weaver repository's code generation utilities for adapter scaffolding (Tier 2 active development).

## Modernization Strategy Framework

The specialist applies a structured modernization strategy framework that guides the transformation from legacy integration to full platform migration. The framework defines four maturity levels for legacy system integration.

**Level 1 (Bridge)**: Legacy system remains primary, with adapters providing read-only access to legacy data for platform consumption. No data flows from platform to legacy system. This level is suitable for initial integration where legacy system modification is not feasible.

**Level 2 (Synchronize)**: Bidirectional data synchronization between legacy system and platform, with conflict resolution policies handling concurrent modifications. Both systems operate on shared data, enabling gradual user migration to platform interfaces.

**Level 3 (Redirect)**: New functionality is built on the platform, with legacy system serving as a backend data source. User-facing operations progressively move to platform interfaces. Legacy system enters maintenance mode.

**Level 4 (Retire)**: All functionality migrated to platform. Legacy system decommissioned after data migration verification. Integration adapters archived in GARDEN for potential future reference.

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination authority enabling the specialist to design cross-system integration architectures, coordinate with domain-specific agents for data mapping, and manage migration workflows that span multiple platform components.

## Integration Architecture

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Runtime execution and adapter lifecycle management |
| [Prismatic Storage](@/glossary/prismatic-storage.md) | Target storage for migrated legacy data |
| [Ecto](@/glossary/ecto.md) | Schema definition and migration tooling for data transformation |
| [GARDEN](@/glossary/garden.md) | Legacy knowledge repository for proven integration patterns |
| Prismatic Telemetry | Integration health [metrics](@/glossary/metrics.md) and migration progress tracking |
| [SEADF](@/glossary/seadf.md) | Autonomous evolution of integration patterns |
| AIAD [Registry](@/glossary/registry-otp.md) | Agent specification and discovery |

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/legacy connect <system>` | Establish adapter connection to a legacy system | L3+ |
| `/legacy migrate <source> <target>` | Initiate data migration between legacy source and platform target | L3+ |
| `/legacy status` | Report connection health and migration progress for all active integrations | L2+ |
| `/legacy patterns` | List available GARDEN integration patterns for a specified legacy system type | L2+ |

## Coordination with Related Agents

| Agent | Relationship |
|-------|-------------|
| [**investigate-coordinator**](@/agents/investigate-coordinator.md) (L3) | Routes investigations that require legacy data source access |
| [**llm-generic-bridge**](@/agents/llm-generic-bridge.md) (L4) | Provides universal platform adaptation patterns applicable to legacy bridging |
| [**cascade-quality-specialist**](@/agents/cascade-quality-specialist.md) (L3) | Tracks quality debt in legacy integration code for progressive improvement |

## Operational Considerations

Legacy integration operates in an inherently uncertain environment. Legacy systems may have undocumented behavior, inconsistent data quality, unreliable availability, and evolving (or deteriorating) APIs. The specialist accounts for these realities through defensive coding patterns: all legacy data is validated upon receipt, connection timeouts are conservatively configured, and fallback behaviors are defined for every expected failure mode.

## Enforcement

The [NO MERCY](@/glossary/no-mercy.md) doctrine requires that integration adapters are production-ready with comprehensive error handling. No adapter enters production without handling all documented error conditions of the legacy system it connects to. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires that data migration operations include verification steps that confirm data integrity, with migration reports documenting any records that could not be migrated and the reasons for their exclusion.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)