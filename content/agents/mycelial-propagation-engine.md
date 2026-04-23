+++
title = "Mycelial Propagation Engine"
weight = 269
[extra]
domain = "cross-platform-pattern-distribution"
level = "L2"
description = "Formally verified pattern propagation engine with 5 core Lean4 theorems guaranteeing safe evolution across the mycelial network"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["mycelial-network", "seadf", "aiad", "supervision-tree", "dynamic-supervisor", "process-isolation", "message-passing", "no-doubts", "telemetry", "no-mercy"]
domain_normalized = "ecosystem"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Mycelial", "Propagation", "Engine", "Formally", "Lean4", "agents", "agent", "Prismatic Platform", "Theorem", "Propagation Engine"]
tags = ["agents", "agent", "mycelial-propagation-engine", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Mycelial Propagation Engine - Prismatic Platform"
+++

## Overview

The Mycelial Propagation Engine operates as an L2 Tactical Operations authority within the Prismatic Platform's cross-platform pattern distribution domain, providing the formally verified execution substrate for pattern propagation across the [mycelial network](@/glossary/mycelial-network.md). While higher-level agents like the Mycelial Network Supreme manage routing decisions and propagation strategy, the Propagation Engine handles the technical execution of pattern delivery with mathematical guarantees of safety. Five core [Lean4](@/glossary/lean4.md) theorems establish formal proofs that propagation operations preserve network integrity, prevent information loss, maintain ordering guarantees, respect capacity constraints, and ensure termination.

Built on the [AIAD](@/glossary/aiad.md) standard and implemented within the [SEADF](@/glossary/seadf.md) evolutionary framework, the engine combines the practical efficiency of Elixir's [message passing](@/glossary/message-passing.md) infrastructure with the mathematical rigor of formal verification. This dual approach ensures that pattern propagation is both fast enough for real-time operations (sub-second delivery for critical patterns) and safe enough for mission-critical information distribution (no pattern loss, no ordering violation, no capacity overflow). The [NO DOUBTS](@/glossary/no-doubts.md) principle is embedded in the engine's architecture: every propagation guarantee is backed by formal proof rather than empirical testing alone.

## Formal Verification Framework

The five core Lean4 theorems that govern the Propagation Engine establish rigorous safety guarantees for all propagation operations. Each theorem has been formally proved and serves as an invariant that the engine must maintain throughout operation.

**Theorem 1: Network Integrity Preservation** -- For any pattern propagation operation P applied to network state S, the resulting state S' maintains all connectivity invariants present in S. Formally: given a connected graph G representing the mycelial network, any propagation operation preserves the connected components of G. This ensures that propagation cannot partition the network or isolate agents.

**Theorem 2: Information Losslessness** -- Every pattern submitted for propagation is either delivered to all designated target domains or explicitly rejected with a recorded rejection reason. No pattern enters the propagation pipeline and disappears silently. This theorem establishes a delivery-or-reject guarantee analogous to atomic transaction semantics.

**Theorem 3: Causal Ordering** -- If pattern A causally precedes pattern B (A was produced before B and B depends on information from A), then A is delivered to every target domain before B. This prevents consumers from processing dependent patterns out of order.

**Theorem 4: Capacity Boundedness** -- The total number of patterns in-flight within the propagation pipeline is bounded by a configurable constant C at all times. This prevents unbounded queue growth that could exhaust system memory.

**Theorem 5: Termination Guarantee** -- Every pattern submitted to the propagation pipeline reaches a terminal state (delivered or rejected) within bounded time T. No pattern remains indefinitely in-flight.

## Operational Domain

The cross-platform pattern distribution domain covers the technical execution of pattern delivery across all mycelial network channels. The engine operates as the execution layer beneath the routing decisions made by higher-level propagation management agents. It receives propagation directives (pattern + target domain list + quality-of-service requirements) and executes them through the platform's [message passing](@/glossary/message-passing.md) infrastructure, maintaining formal invariants throughout execution.

The engine manages propagation buffers for each target domain, implementing backpressure through the [GenStage](@/glossary/genstage.md) demand model to prevent overwhelming consumers. Buffer management respects the Capacity Boundedness theorem by enforcing per-domain and global in-flight pattern limits. When limits are approached, the engine applies priority-based admission control that rejects lower-priority patterns while maintaining delivery guarantees for higher-priority ones.

## Key Capabilities

- **Formally verified delivery** -- Executes pattern propagation with Lean4-proven guarantees of integrity preservation, losslessness, causal ordering, capacity boundedness, and termination, providing mathematical assurance rather than probabilistic confidence
- **Multi-channel propagation** -- Manages dedicated propagation channels for each target domain with independent flow control, enabling different domains to consume patterns at different rates without mutual interference
- **Priority-based admission control** -- When propagation capacity is constrained, applies priority-weighted admission that ensures critical patterns are delivered while lower-priority patterns are explicitly rejected with recorded reasons
- **Causal dependency tracking** -- Maintains a dependency graph between patterns, ensuring that causally related patterns are delivered in correct order across all target domains
- **Backpressure-aware delivery** -- Integrates with consumer demand signals through [GenStage](@/glossary/genstage.md) to adapt delivery rates to consumer processing capacity, preventing buffer overflows and consumer overload
- **Delivery confirmation** -- Tracks per-pattern delivery status with confirmed delivery receipts from consumers, enabling end-to-end delivery verification
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with self-managed buffer levels, adaptive delivery rates, and automatic failover for degraded channels
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** publishing propagation metrics including delivery latency distributions, buffer utilization, admission control statistics, and per-theorem invariant verification results

## Authority Level

**L2** - Tactical Operations - Domain-specific [tactical execution](@/glossary/tactical-execution.md) with authority over pattern delivery mechanics, buffer management, and flow control within the propagation infrastructure.

## Engine Architecture

The Propagation Engine is implemented as an [OTP](@/glossary/otp.md) application with a [supervision tree](@/glossary/supervision-tree.md) that isolates per-domain delivery workers from the central coordination process. The central coordinator receives propagation directives from higher-level agents, validates them against formal invariants, assigns them to domain-specific delivery workers, and tracks their lifecycle through to terminal state.

Each delivery worker operates as an independent [GenServer](@/glossary/genserver.md) process, managed by a [Dynamic Supervisor](@/glossary/dynamic-supervisor.md) that enables runtime scaling. When propagation traffic to a specific domain increases, additional workers are spawned to handle the load. When traffic decreases, excess workers are gracefully terminated. [Process isolation](@/glossary/process-isolation.md) ensures that a delivery worker crash does not affect workers for other domains.

The engine maintains an in-memory causal dependency graph that tracks relationships between patterns. Before delivering a pattern, the engine verifies that all causally prior patterns have been confirmed delivered to the same target domain. If a dependency has not yet been delivered, the dependent pattern is held in a dependency-wait buffer until its prerequisites are satisfied.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/propagation status` | Display engine status including buffer levels and delivery rates | L2+ |
| `/propagation invariants` | Show current verification status for all five formal invariants | L2+ |
| `/propagation channels` | List active propagation channels with per-channel metrics | L2+ |
| `/propagation flush` | Force delivery of all buffered patterns (emergency use) | L1+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [mycelial-network-supreme](@/agents/mycelial-network-supreme.md) | Receives propagation directives with routing decisions and QoS requirements |
| [mycelial-network-coordinator](@/agents/mycelial-network-coordinator.md) | Reports propagation health metrics and receives resource allocation adjustments |
| [mycelial-healer-specialist](@/agents/mycelial-healer-specialist.md) | Coordinates channel repair when delivery failures indicate network degradation |
| [network-health-monitor](@/agents/network-health-monitor.md) | Provides network health context for delivery path selection |

## Invariant Monitoring

The engine continuously monitors compliance with its five formal invariants through runtime assertion checking. Each invariant has a corresponding monitoring function that evaluates the current engine state against the invariant's requirements. Monitoring runs at configurable intervals (default: every 100 propagation operations) and publishes verification results through [telemetry](@/glossary/telemetry.md). An invariant violation triggers an emergency response: the engine halts propagation, preserves current state for forensic analysis, and notifies the [mycelial-network-coordinator](@/agents/mycelial-network-coordinator.md) for intervention.

## Enforcement

The Propagation Engine enforces the [NO MERCY](@/glossary/no-mercy.md) doctrine at the execution level: no pattern is silently dropped, no ordering violation is tolerated, and no capacity overflow is permitted. The [NO DOUBTS](@/glossary/no-doubts.md) principle is embodied in the formal verification approach: delivery guarantees are proven rather than merely tested. The [Trinity Gate](@/glossary/trinity-gate.md) validates that the engine's runtime behavior conforms to its formal specification, with structural, logical, and formal consistency checks applied to every state transition.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)