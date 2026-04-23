+++
title = "event-driven-architecture-specialist"
weight = 155
[extra]
domain = "architecture"
level = "L3"
description = "Event sourcing, CQRS patterns, and event-driven system design"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["otp", "beam", "supervision-tree", "genserver", "aiad", "3nl", "umbrella-application", "ecto", "phoenix", "no-doubts"]
domain_normalized = "architecture"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1950
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["event-driven-architecture-specialist", "Event", "CQRS", "agents", "agent", "Prismatic Platform", "Driven Architecture", "Specialist", "Events"]
tags = ["agents", "agent", "event-driven-architecture-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "event-driven-architecture-specialist - Prismatic Platform"
+++

## Overview

The Event-Driven Architecture Specialist operates as an L3 strategic command agent within the Architecture domain of the Prismatic Platform. This agent provides expertise in [event sourcing](@/glossary/event-sourcing.md), [CQRS](@/glossary/cqrs.md) (Command Query Responsibility Segregation) patterns, and event-driven system design -- architectural approaches that model state changes as immutable sequences of events rather than mutable state mutations. In a platform built on [Elixir](@/glossary/elixir.md)/[OTP](@/glossary/otp.md) with its inherent support for message passing and process isolation, event-driven patterns align naturally with the runtime's capabilities.

The Prismatic Platform processes continuous streams of events: intelligence collection results, compliance assessment outcomes, quality measurements, security scan findings, and agent coordination signals. Each of these represents a state change in the system -- new information that affects decisions, assessments, and actions. The Event-Driven Architecture Specialist ensures that these events are captured, stored, and processed in ways that preserve complete audit trails, enable temporal queries ("what was the state at time T?"), and support complex event processing that derives higher-order insights from event streams.

The agent operates under the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. For event-driven architecture, NO DOUBTS means that every architectural decision about event schemas, event store configuration, and projection design is backed by formal analysis of consistency requirements, ordering guarantees, and failure recovery behavior. Events are the immutable record of what happened -- they must be designed with the same rigor as database schemas, because they cannot be changed after publication.

## Operational Domain

The Architecture domain governs the structural foundations of the platform. The Event-Driven Architecture Specialist focuses on patterns where state is derived from event sequences rather than stored directly. This includes event sourcing (persisting events as the source of truth), CQRS (separating read and write models), event-driven integration (using events to coordinate between bounded contexts), and complex event processing (deriving higher-order events from event streams).

The [BEAM](@/glossary/beam.md) runtime provides natural primitives for event-driven architecture: lightweight processes as event handlers, [GenServer](@/glossary/genserver.md)s as event processors, Phoenix.PubSub for event distribution, and GenStage for backpressure-aware event streaming. The specialist ensures that the platform's event-driven components leverage these primitives effectively rather than reimplementing event infrastructure from scratch.

## Key Capabilities

The Event-Driven Architecture Specialist provides six core architectural capabilities for event-driven systems.

**Event schema design** defines the structure, semantics, and versioning of events published by platform components. Each event type has a defined schema specifying its fields, types, and invariants. Events are designed as immutable facts about what happened (past tense: `InvestigationStarted`, `ComplianceAssessmentCompleted`, `QualityGatesFailed`) rather than commands about what should happen. Schema versioning enables backward-compatible event evolution without breaking existing consumers.

**Event store architecture** designs and reviews the persistence layer for event streams, including storage engine selection, partitioning strategy, retention policy, and query capability. The specialist evaluates trade-offs between different storage approaches: [PostgreSQL](@/glossary/postgresql.md)-backed event stores for ACID guarantees, log-structured stores for write throughput, and hybrid approaches that combine durability with performance. Event stores must support efficient append operations, stream-level reads, and position-based subscriptions.

**CQRS implementation** designs the separation between command (write) and query (read) models, enabling each to be optimized independently. Write models enforce business rules and emit events; read models are projections that consume events and build query-optimized views. The specialist designs projection strategies that balance consistency (how quickly projections reflect recent events) against performance (query response time) based on each use case's requirements.

**Event-driven integration** designs cross-boundary communication patterns where events serve as the integration medium between bounded contexts. Rather than direct API calls between subsystems, the specialist implements publish-subscribe patterns where producing systems emit events that consuming systems process asynchronously. This reduces coupling between subsystems and enables independent deployment and scaling.

**Complex event processing** designs patterns for deriving higher-order events from combinations of lower-level events. For example, detecting "suspicious activity" from a combination of failed authentication events, unusual data access patterns, and geographic anomalies requires correlation across multiple event streams. The specialist designs event processing topologies that aggregate, filter, and correlate events using [GenStage](@/glossary/genstage.md) pipelines with configurable window sizes and correlation rules.

**Event replay and temporal queries** enables reconstructing system state at any point in time by replaying events from the event store. This capability is essential for audit compliance (reproducing the exact state when a decision was made), debugging (understanding the sequence of events that led to an error), and testing (replaying production event sequences against new code to verify behavior). The specialist designs event stores and projections that support efficient replay operations.

## Event-Driven Patterns in the Platform

The specialist maintains a catalog of event-driven patterns currently used across the platform.

| Pattern | Application | Implementation |
|---------|------------|----------------|
| Event sourcing | Intelligence findings | Events as source of truth for investigation state |
| CQRS | Compliance dashboard | Separate write (assessment) and read (dashboard) models |
| Event-driven integration | Cross-domain coordination | PubSub events between intelligence and compliance |
| Saga orchestration | Multi-step operations | Coordinated event sequences with compensation |
| Event notification | Agent coordination | Lightweight events for status changes |
| Event-carried state transfer | Cache invalidation | Events carrying updated state for downstream caches |

## Event Schema Governance

Event schemas are governed with the same rigor as database schemas.

| Governance Rule | Enforcement | Rationale |
|----------------|-------------|-----------|
| Immutability | Events never modified after publication | Audit trail integrity |
| Schema registry | All event types registered centrally | Discoverability and validation |
| Backward compatibility | New fields optional, existing fields stable | Consumer stability |
| Versioning | Explicit version in event metadata | Migration support |
| Documentation | Every event type fully documented | Consumer development |

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - The Event-Driven Architecture Specialist operates at the strategic command level with authority to mandate event schema standards, review event store configurations, and coordinate event-driven integration patterns across domain boundaries.

## Integration Architecture

| Component | Relationship | Purpose |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Event producers/consumers | Agent lifecycle events and coordination signals |
| AIAD [Registry](@/glossary/registry-otp.md) | Event schema registry | Centralized event type discovery and validation |
| Prismatic [Telemetry](@/glossary/telemetry.md) | Performance metrics | Event processing latency and throughput tracking |
| [Phoenix](@/glossary/phoenix.md) PubSub | Event distribution | Real-time event broadcasting across processes and nodes |
| [PostgreSQL](@/glossary/postgresql.md) | Event storage | Durable event store with ACID guarantees |
| [GenStage](@/glossary/genstage.md) | Stream processing | Backpressure-aware event processing pipelines |

## Enforcement

The Event-Driven Architecture Specialist enforces [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. Events published without schema registration are rejected. Event schemas that break backward compatibility without a migration plan are blocked. Event stores without retention policies are flagged as compliance risks. Projections without explicit consistency guarantees are rejected. Every event-driven architectural decision must explicitly address ordering guarantees, at-least-once vs. exactly-once delivery, and failure recovery behavior.

## Related Agents

- [**database-architecture-specialist**](@/agents/database-architecture-specialist.md) (L3) - Data modeling and database selection for event stores
- [**distributed-systems-specialist**](@/agents/distributed-systems-specialist.md) (L3) - Distributed consistency guarantees for event systems
- [**messaging-architecture-specialist**](@/agents/messaging-architecture-specialist.md) (L3) - Message queue patterns for event distribution

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)