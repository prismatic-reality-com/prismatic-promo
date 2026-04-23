+++
title = "distributed-systems-specialist"
weight = 136
[extra]
domain = "architecture"
level = "L3"
description = "Distributed computing patterns, consensus algorithms, and system coordination"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["otp", "beam", "supervision-tree", "genserver", "aiad", "3nl", "umbrella-application", "ecto", "phoenix", "no-doubts"]
domain_normalized = "architecture"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1900
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["distributed-systems-specialist", "Distributed", "agents", "agent", "Prismatic Platform", "Distributed Systems", "Specialist", "The Distributed"]
tags = ["agents", "agent", "distributed-systems-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "distributed-systems-specialist - Prismatic Platform"
+++

## Overview

The Distributed Systems Specialist operates as an L3 strategic command agent within the Architecture domain of the Prismatic Platform. This agent provides expertise in distributed computing patterns, [consensus algorithm](@/glossary/consensus-algorithm.md)s, system coordination protocols, and the design of fault-tolerant distributed architectures. In a platform built on [Elixir](@/glossary/elixir.md)/[OTP](@/glossary/otp.md) and the [BEAM](@/glossary/beam.md) virtual machine -- a runtime explicitly designed for distributed, fault-tolerant systems -- the Distributed Systems Specialist ensures that the platform leverages these capabilities to their fullest extent rather than treating distribution as an afterthought bolted onto a monolithic design.

The Prismatic Platform operates as a 90-application [umbrella](@/glossary/umbrella-application.md) with components that must coordinate across process boundaries, node boundaries, and potentially geographic boundaries. The Distributed Systems Specialist evaluates every architectural decision through the lens of distribution: How does this design behave when the network partitions? What happens when a node fails? How does this data model handle concurrent updates from multiple sources? These questions are not edge cases -- in distributed systems, they are the normal operating conditions that the architecture must handle correctly.

This agent operates under the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. For distributed systems, NO DOUBTS is particularly critical: every design decision must be backed by formal reasoning about consistency guarantees, failure modes, and partition behavior. The CAP theorem, PACELC theorem, and the FLP impossibility result are not academic abstractions -- they are engineering constraints that bound what any distributed system can achieve, and every design review accounts for them explicitly.

## Operational Domain

The Architecture domain governs the structural foundations of the platform. The Distributed Systems Specialist focuses specifically on how platform components interact across distribution boundaries -- process-to-process communication within a node, node-to-node communication within a cluster, and service-to-service communication across deployment boundaries. Each distribution boundary introduces specific challenges around latency, failure detection, and state consistency that require distinct architectural patterns.

The BEAM runtime provides native support for distributed computing through Erlang distribution, process linking across nodes, and location-transparent messaging. The specialist ensures that the platform exploits these capabilities while understanding their limitations -- Erlang distribution assumes a trusted network and does not provide strong consistency guarantees across nodes without additional coordination mechanisms.

## Key Capabilities

The Distributed Systems Specialist provides architectural guidance across six critical areas of distributed system design.

**Consensus protocol design** evaluates and recommends consensus mechanisms appropriate to specific coordination requirements. For leader election, the specialist considers Raft-based approaches through libraries like `ra`. For distributed state synchronization, it evaluates CRDTs (Conflict-free Replicated Data Types) that provide eventual consistency without coordination overhead. For critical-path coordination, it designs two-phase commit protocols with appropriate timeout and recovery semantics.

**Partition tolerance architecture** designs systems that maintain defined behavior under network partition conditions. Following the CAP theorem, the specialist makes explicit trade-offs between consistency and availability for each data domain, documenting which guarantees each component provides during partitioned operation. Components requiring strong consistency use synchronous coordination at the cost of availability; components favoring availability use eventual consistency with conflict resolution strategies.

**Failure detection and recovery** implements reliable failure detection through heartbeat protocols, phi accrual failure detectors, and OTP's native process monitoring. The specialist designs [supervision tree](@/glossary/supervision-tree.md)s that implement appropriate restart strategies for distributed components -- accounting for the fact that a crashed process on a remote node requires different recovery procedures than a locally crashed process.

**Distributed state management** designs state management approaches that maintain correctness across distribution boundaries. This includes [ETS](@/glossary/ets.md)-based local caching with invalidation protocols, Horde-based distributed registries for global process addressing, and [Ecto](@/glossary/ecto.md)-backed persistence for durable state with optimistic concurrency control.

**Message ordering and delivery guarantees** designs communication protocols with explicit ordering and delivery semantics. The specialist distinguishes between at-most-once, at-least-once, and exactly-once delivery requirements, implementing appropriate mechanisms for each. For ordered delivery, it designs sequence-numbered protocols with gap detection and retransmission.

**Performance and scalability analysis** evaluates distributed architectures for bottlenecks, hotspots, and scaling limitations. The specialist identifies synchronization points that limit horizontal scalability, communication patterns that generate excessive network traffic, and state distribution strategies that create imbalanced load across cluster nodes.

## Distributed Patterns in the Prismatic Platform

The platform employs several distributed patterns that the specialist has designed and maintains.

| Pattern | Application | Implementation |
|---------|------------|----------------|
| Process Registry | Agent addressing | Horde.Registry for cluster-wide process discovery |
| Dynamic Supervision | Agent lifecycle | Horde.DynamicSupervisor for distributed agent spawning |
| Event Distribution | Cross-domain events | Phoenix.PubSub for node-local and cluster-wide event distribution |
| State Replication | Configuration | CRDT-based configuration sync across cluster nodes |
| Leader Election | Singleton processes | Raft-based leader election for coordinator processes |
| Sharded Processing | Data ingestion | Hash-based partition assignment for parallel processing |

## Consistency Models

The specialist maintains a catalog of consistency models used across platform components, ensuring that each component's consistency requirements are explicitly documented and correctly implemented.

| Component | Consistency Model | Rationale |
|-----------|------------------|-----------|
| Agent Registry | Eventual (CRDT) | Availability preferred; stale reads acceptable for discovery |
| Quality Metrics | Strong (Ecto) | Correctness critical; quality decisions must reflect latest state |
| Telemetry Events | At-most-once | Performance preferred; occasional event loss acceptable |
| Intelligence Reports | Causal | Reports must reflect causal ordering of evidence |
| Configuration | Eventual (gossip) | Configuration changes propagate within bounded time |

## Design Review Process

Architectural proposals involving distributed components undergo mandatory review by the Distributed Systems Specialist before implementation.

The review evaluates five dimensions: correctness under normal operation, behavior during network partitions, recovery after partition healing, performance characteristics at expected scale, and operational complexity of the proposed design. Each dimension receives an explicit assessment with supporting reasoning. Proposals that fail on correctness or partition behavior are rejected; proposals with performance or complexity concerns receive conditional approval with mitigation recommendations.

## Authority Level

**L3** - Strategic Command - The Distributed Systems Specialist operates at the strategic command level with multi-domain coordination authority. It can mandate distributed design patterns, reject architectures that violate distributed systems principles, and coordinate with specialists in other Architecture-domain agents on cross-cutting concerns.

## Integration Architecture

| Component | Relationship | Purpose |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Runtime execution | Agent process distribution across cluster nodes |
| AIAD [Registry](@/glossary/registry-otp.md) | Agent discovery | Distributed agent registration and capability lookup |
| Prismatic [Telemetry](@/glossary/telemetry.md) | Observability | Distributed tracing and cross-node performance metrics |
| [Phoenix](@/glossary/phoenix.md) PubSub | Event distribution | Cluster-wide event broadcasting for real-time features |
| [PostgreSQL](@/glossary/postgresql.md) | Persistent state | Serializable transactions for strong consistency requirements |

## Enforcement

The Distributed Systems Specialist enforces [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine with particular emphasis on formal reasoning about distributed behavior. Every distributed design must explicitly state its consistency model, partition behavior, and failure recovery strategy. Designs that hand-wave about "eventual consistency" without specifying convergence guarantees are rejected. Race conditions, split-brain scenarios, and message ordering assumptions must be addressed in design documents before implementation begins.

## Related Agents

- [**database-architecture-specialist**](@/agents/database-architecture-specialist.md) (L3) - Data modeling, schema design, and database selection strategies
- [**event-driven-architecture-specialist**](@/agents/event-driven-architecture-specialist.md) (L3) - [Event sourcing](@/glossary/event-sourcing.md), [CQRS](@/glossary/cqrs.md) patterns, and event-driven system design
- [**messaging-architecture-specialist**](@/agents/messaging-architecture-specialist.md) (L3) - Message queue architecture, pub/sub patterns, and async communication

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)