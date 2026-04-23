+++
title = "system-architecture-specialist"
weight = 390
[extra]
domain = "architecture"
level = "L3"
description = "Overall system design, architectural patterns, and technology stack decisions with genetic enhancements for type safety, verification protocols, and multi-team coordination."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["otp", "beam", "supervision-tree", "genserver", "aiad", "3nl", "umbrella-application", "ecto", "phoenix", "no-doubts"]
domain_normalized = "architecture"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2200
quality_score = 84
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["system-architecture-specialist", "Overall", "agents", "agent", "Prismatic Platform", "BEAM", "Architecture", "System Architecture"]
tags = ["agents", "agent", "system-architecture-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "system-architecture-specialist - Prismatic Platform"
+++

## Overview

The System Architecture Specialist is an L3 strategic command agent operating within the Prismatic Platform's architecture domain, responsible for overall system design, architectural pattern selection, and technology stack decisions that govern the platform's structural foundation. With genetic enhancements for type safety verification, formal verification protocols, and multi-team coordination, this agent ensures that architectural decisions produce systems that are structurally sound, maintainable, and aligned with the platform's long-term evolutionary trajectory.

The Prismatic Platform comprises over 90 applications organized as an Elixir [umbrella application](@/glossary/umbrella-application.md), running on the [BEAM](@/glossary/beam.md) virtual machine with [OTP](@/glossary/otp.md) supervision trees providing fault tolerance and process isolation. The System Architecture Specialist governs the structural decisions that shape this complex system, from inter-application dependency management to data flow architecture and service boundary definition. It operates under the [AIAD](@/glossary/aiad.md) standard and enforces the [No Mercy, No Doubts](@/glossary/no-doubts.md) doctrine, requiring that every architectural decision is backed by evidence and thorough analysis.

## Theoretical Foundations

Software architecture as a discipline draws from foundational work by Perry and Wolf, who formalized the concept of software architecture as a set of architectural elements, the form they take, and the rationale for their arrangement. The System Architecture Specialist implements this theoretical framework through systematic evaluation of architectural alternatives, explicit documentation of design rationale, and formal verification of structural properties.

The concept of architectural styles, as catalogued by Shaw and Garlan, provides the vocabulary for describing recurring structural patterns. The agent maintains expertise in multiple architectural styles relevant to the Prismatic Platform: layered architecture for separation of concerns, microservices for independent deployment and scaling, event-driven architecture for asynchronous processing, and actor-model concurrency as implemented by the BEAM virtual machine.

The [OTP](@/glossary/otp.md) design principles provide a platform-specific architectural framework that the agent enforces. The "let it crash" philosophy, [supervision trees](@/glossary/supervision-tree.md), and process-based isolation create an architectural paradigm where fault tolerance is a structural property rather than an afterthought. The agent ensures that all architectural decisions leverage these OTP capabilities rather than reimplementing equivalent mechanisms in less robust ways.

Architecture decision records (ADRs) formalize the documentation practice for architectural decisions, capturing the context, decision, and consequences of each significant architectural choice. The agent produces and maintains ADRs for all decisions within its scope, creating an auditable history of architectural evolution.

## Core Capabilities

**System Design Governance** establishes and enforces architectural standards across the platform's 90+ applications. The agent defines application boundary rules, inter-application communication protocols, shared library policies, and dependency direction constraints. These standards ensure that the umbrella application maintains structural coherence as it grows.

**Technology Stack Evaluation** assesses candidate technologies against the platform's requirements for performance, reliability, maintainability, and ecosystem compatibility. Evaluations follow a structured methodology that considers technical merit, community maturity, licensing implications, and alignment with the existing BEAM/OTP technology stack. The agent applies the meta-rule that architectural solutions that could be identically implemented in Node.js are categorically wrong for the Prismatic Platform.

**Architectural Pattern Selection** matches system requirements to appropriate architectural patterns, considering trade-offs between competing quality attributes. The agent maintains a pattern library derived from both academic literature and the platform's [GARDEN](@/glossary/garden.md) knowledge base, providing proven solutions for recurring architectural challenges.

**Type Safety Verification** leverages genetic enhancements that strengthen the agent's ability to verify type safety across system boundaries. This includes ensuring consistent type specifications across application interfaces, validating that data transformations preserve type invariants, and detecting type mismatches that could cause runtime failures.

**Multi-Team Coordination** facilitates architectural decision-making across distributed teams working on different platform subsystems. The agent ensures that teams' architectural choices are compatible, that shared components evolve in ways that maintain backward compatibility, and that cross-cutting concerns are addressed consistently.

## Architecture and Implementation

The System Architecture Specialist is implemented as an [OTP](@/glossary/otp.md) [GenServer](@/glossary/genserver.md) process within the Prismatic architecture subsystem, maintaining a persistent model of the platform's architectural state.

| Component | Function | Implementation |
|-----------|----------|---------------|
| Architecture Model | Maintain current system structure representation | ETS-backed graph model |
| Decision Engine | Evaluate architectural alternatives | Multi-criteria decision analysis |
| Pattern Library | Store and retrieve architectural patterns | GARDEN-integrated knowledge base |
| Dependency Analyzer | Track and validate inter-app dependencies | Static analysis pipeline |
| Type Verifier | Cross-boundary type safety checking | Dialyzer integration |
| ADR Manager | Create and maintain architecture decision records | Structured document generation |

The architecture model represents the platform as a directed graph where nodes are applications and edges represent dependencies. This graph supports queries about dependency depth, circular dependency detection, fan-in and fan-out analysis, and topological ordering for build and deployment sequencing.

The dependency analyzer implements continuous validation of the platform's dependency structure, detecting violations such as circular dependencies, inappropriate coupling between domains, and dependencies that skip architectural layers. Violations are reported as architectural debt items with severity ratings and remediation guidance.

## Architectural Principles

The agent enforces a set of architectural principles derived from both established software engineering practice and platform-specific requirements.

| Principle | Description | Enforcement |
|-----------|-------------|-------------|
| OTP First | Every stateful entity has its own process | Mandatory for all new code |
| Functional Purity | Side effects confined to system edges | Structural analysis |
| Supervision Before Implementation | Document supervision tree before coding | Design review gate |
| Domain Isolation | Applications encapsulate domain boundaries | Dependency analysis |
| Protocol-Based Integration | Applications communicate through defined protocols | Interface verification |
| Type Safety | All public functions have verified typespecs | Dialyzer enforcement |

The "OTP First" principle ensures that the platform fully leverages the BEAM virtual machine's concurrency model. The agent reviews architectural proposals to verify that stateful components are modeled as processes with appropriate supervision, that message passing is used for inter-process communication, and that [ETS](@/glossary/ets.md) tables are used for shared read-heavy state rather than introducing external state management systems.

## Design Review Process

The System Architecture Specialist conducts structured design reviews for significant architectural changes. The review process evaluates proposals against multiple quality attributes.

**Structural Soundness** assesses whether the proposed architecture maintains clean dependency structures, appropriate abstraction levels, and clear responsibility assignments. The agent verifies that changes do not introduce architectural anti-patterns such as circular dependencies, god modules, or leaky abstractions.

**Scalability Analysis** evaluates whether the architecture supports the platform's growth trajectory. This includes analysis of data volume scaling, concurrent user scaling, and operational scaling as new applications are added to the umbrella.

**Fault Tolerance Assessment** verifies that the architecture provides appropriate resilience through [supervision trees](@/glossary/supervision-tree.md), circuit breaker patterns, graceful degradation, and recovery mechanisms. The agent ensures that failure in one component cannot cascade to unrelated system areas.

**Maintainability Evaluation** assesses the long-term maintenance burden of architectural decisions, considering factors such as code complexity, team cognitive load, documentation requirements, and testing overhead. Architectures that optimize for short-term development speed at the expense of long-term maintainability are flagged for reconsideration.

## Integration Points

| System | Integration Role | Interaction Pattern |
|--------|-----------------|-------------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Agent lifecycle management | OTP supervision |
| [Prismatic Telemetry](@/glossary/telemetry.md) | Architecture health metrics | Continuous monitoring |
| [AIAD Registry](@/glossary/registry-otp.md) | Agent specification repository | Read/Write |
| [Phoenix](@/glossary/phoenix.md) Framework | Web architecture governance | Configuration oversight |
| [Ecto](@/glossary/ecto.md) | Data architecture management | Schema review |
| [GARDEN](@/glossary/garden.md) | Architectural pattern library | Pattern retrieval |
| [Trinity Gate](@/glossary/trinity-gate.md) | Architectural decision verification | Mandatory review |

## Technology Stack Governance

The agent maintains governance over the platform's technology stack, ensuring that technology choices remain aligned with architectural objectives.

The core stack of Elixir/OTP, [Phoenix](@/glossary/phoenix.md), [Ecto](@/glossary/ecto.md), and [LiveView](@/glossary/liveview.md) provides the foundation for all web-facing components. PostgreSQL serves as the primary relational database, with [ETS](@/glossary/ets.md) providing in-memory state management. KuzuDB handles graph data requirements, Meilisearch provides full-text search capabilities, and Redis supports caching and pub/sub messaging.

Technology additions to the stack require formal evaluation through the agent's technology assessment framework, which considers technical fit, operational complexity, team expertise, and long-term viability. The agent maintains a technology radar that classifies technologies as adopt, trial, assess, or hold, guiding teams toward well-evaluated choices.

## Quality Assurance

Architectural quality is assessed through quantitative metrics that track structural health over time. Metrics include dependency depth, cyclomatic complexity distribution, application cohesion scores, coupling measurements, and type specification coverage. These metrics feed into the platform's quality floor guardian, which prevents architectural degradation by blocking changes that would decrease structural quality below established thresholds.

## Related Agents

The System Architecture Specialist collaborates with the [technical-assessor](@/agents/technical-assessor.md) for technology evaluation support and the [tech-debt-analyst](@/agents/tech-debt-analyst.md) for identifying architectural debt. The [systematic-verifier](@/agents/systematic-verifier.md) provides verification capabilities for architectural invariants. The [ui-flowbite-specialist](@/agents/ui-flowbite-specialist.md) contributes frontend architecture expertise within the design system domain.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)