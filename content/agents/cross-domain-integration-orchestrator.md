+++
title = "cross-domain-integration-orchestrator"
weight = 104
[extra]
domain = "integration"
level = "L3"
description = "Domain boundary integration with mycelial pattern propagation for cross-domain intelligence fusion and adapter-based external system connectivity."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "telemetry", "mycelial-network", "ecto", "genserver", "supervision-tree", "message-passing"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1880
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["cross-domain-integration-orchestrator", "Domain", "agents", "agent", "Prismatic Platform", "Event", "Integration"]
tags = ["agents", "agent", "cross-domain-integration-orchestrator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "cross-domain-integration-orchestrator - Prismatic Platform"
+++

## Overview

The Cross-Domain Integration Orchestrator operates as an L3 [strategic command](@/glossary/strategic-command.md) agent within the Integration domain of the Prismatic Platform. This agent manages domain boundary integration with [mycelial network](@/glossary/mycelial-network.md) pattern propagation for cross-domain [intelligence fusion](@/glossary/intelligence-fusion.md). In a platform with 90 umbrella applications spanning intelligence, compliance, infrastructure, and quality domains, the ability to seamlessly move data and coordinate operations across domain boundaries is essential for producing unified intelligence products.

Integration challenges in the Prismatic ecosystem are distinct from those in conventional enterprise systems. The platform combines real-time OSINT data ingestion, batch registry crawling, graph-based entity resolution, time-series security metrics, and interactive LiveView dashboards -- each with different data models, latency requirements, and consistency guarantees. The Cross-Domain Integration Orchestrator provides the connective tissue that enables these diverse subsystems to collaborate without tight coupling, using adapter patterns, event-driven messaging, and protocol-based contracts that isolate domain-specific concerns while enabling cross-domain data flow.

The orchestrator draws on the mycelial network architecture, a biological-inspired communication substrate that enables asynchronous pattern distribution across domain boundaries. Like fungal mycelial networks that transport nutrients between distant parts of a forest ecosystem, the platform's mycelial layer transports intelligence signals, quality metrics, and operational events between domains that have no direct dependencies on each other.

## Integration Architecture

The integration architecture follows a hub-and-spoke model where the orchestrator serves as the central coordination point for cross-domain data flows. Each domain exposes a well-defined integration surface through adapter modules that implement the platform's integration protocol behavior. These adapters translate domain-specific data structures into canonical integration formats and back, preventing domain model contamination while enabling meaningful data exchange.

The canonical integration format uses a common envelope structure that wraps domain-specific payloads with standardized metadata including source domain, timestamp, correlation ID, schema version, and quality indicators. This envelope enables routing, filtering, and auditing at the integration layer without requiring knowledge of the payload contents. Domain-specific processing occurs only at the endpoints, where adapters unwrap envelopes and translate payloads into local domain models.

Protocol-based contracts define the integration surface for each domain. These contracts specify the message types a domain can produce and consume, the quality-of-service guarantees it requires, and the error handling behavior it expects. Contract compliance is verified at compile time through Elixir behaviors and at runtime through integration tests that exercise the complete data flow path. This dual verification ensures that integration contracts remain valid as domains evolve independently.

## Event-Driven Coordination

Cross-domain coordination uses an event-driven architecture where domains communicate through events rather than direct function calls. This decoupling ensures that a failure or slowdown in one domain does not cascade to others, and that new consumers can subscribe to existing event streams without modifying producers.

The event system is built on [GenStage](@/glossary/genstage.md) and Broadway for high-throughput event processing with backpressure support. Producers emit events at their natural rate, and the GenStage backpressure mechanism ensures that slow consumers are not overwhelmed while fast consumers receive events without artificial throttling. The orchestrator manages producer-consumer topology, adding and removing subscriptions as domain requirements change.

Event routing uses topic-based subscription where consumers declare interest in specific event categories. The orchestrator maintains a routing table that maps event topics to subscriber lists, enabling multicast delivery where a single event can trigger processing in multiple consuming domains. Routing rules support both exact topic matching and wildcard patterns for broader subscription scopes.

Event ordering guarantees are configurable per integration path. Some cross-domain flows require strict ordering where events must be processed in the sequence they were produced. Others tolerate out-of-order delivery where events can be processed independently. The orchestrator enforces the appropriate ordering semantics for each integration path based on its configured consistency requirements.

## Adapter Pattern Implementation

The adapter pattern is the primary mechanism for connecting external systems to the platform's integration fabric. Each external system connection is encapsulated in an adapter module that implements a standardized behavior, providing a uniform interface regardless of the external system's native protocol.

Adapters handle protocol translation, converting between the platform's internal message format and the external system's API conventions. This translation encompasses HTTP REST, GraphQL, SOAP, database protocols, file-based exchange, and message queue protocols. The adapter abstracts these protocol differences, presenting a consistent interface to the integration layer.

Connection management within adapters includes connection pooling, credential rotation, circuit breaker patterns, and health monitoring. Each adapter maintains its own connection pool sized for the external system's throughput capabilities. Circuit breakers prevent cascading failures when external systems become unresponsive, automatically opening the circuit after a configurable number of failures and attempting reconnection after a cooldown period.

Error handling in adapters follows a classified response strategy. Transient errors (network timeouts, temporary unavailability) trigger automatic retry with exponential backoff. Permanent errors (authentication failures, invalid requests) are returned immediately to the caller. Unknown errors are logged with full context and treated conservatively as transient unless reclassified by operator investigation.

## Data Consistency Management

Maintaining data consistency across domain boundaries is one of the orchestrator's most critical responsibilities. In a distributed system where each domain maintains its own data store, achieving global consistency requires careful coordination.

The orchestrator implements eventual consistency with conflict detection as its primary consistency model. Domains are authoritative over their own data and publish change events when their data is modified. The orchestrator propagates these changes to interested consumers, which update their local projections accordingly. When conflicting changes are detected (two domains modifying related data simultaneously), the orchestrator flags the conflict for resolution rather than silently overwriting one version.

Saga orchestration handles multi-domain operations that require coordinated changes across several domains. The orchestrator manages saga execution, tracking the completion status of each step and executing compensating actions when a step fails after previous steps have already committed. This approach provides transactional semantics across domain boundaries without requiring distributed transactions, which are impractical in a system with heterogeneous storage backends.

Data version tracking ensures that consumers can detect when they are processing stale data. The orchestrator attaches version vectors to cross-domain data, enabling consumers to determine whether they have the latest version and to request updates when they detect version lag.

## Mycelial Network Integration

The mycelial network provides the biological-inspired transport layer for cross-domain pattern propagation. Unlike the event system which handles discrete messages, the mycelial network specializes in continuous signal propagation where patterns, metrics, and health indicators flow throughout the platform ecosystem.

Pattern propagation through the mycelial network enables successful implementations in one domain to influence other domains. When a quality improvement pattern proves effective in the Intelligence domain, the mycelial network propagates its description and fitness metrics to other domains where similar improvements might apply. The Cross-Pollination Specialist consumes these propagation signals and evaluates their applicability in target domains.

Health signal propagation enables system-wide situational awareness. When a domain detects degraded performance or quality regression, its health signals propagate through the mycelial network, allowing dependent domains to adjust their behavior proactively. For example, if the OSINT crawling domain reports reduced data freshness for a particular source, the Intelligence domain can adjust its confidence scores for intelligence products that depend on that source.

## Monitoring and Observability

Integration monitoring provides visibility into cross-domain data flows, enabling rapid detection of integration failures, bottlenecks, and contract violations.

Flow monitoring tracks the volume, latency, and error rate of data flowing through each integration path. These metrics feed dashboards that provide operators with a real-time view of integration health. Anomaly detection identifies unusual patterns such as sudden volume drops that might indicate a producer failure or latency spikes that suggest a consumer bottleneck.

Contract compliance monitoring verifies that all domains continue to comply with their published integration contracts. This includes schema validation of exchanged messages, response time verification against SLA commitments, and behavioral compliance testing through synthetic transactions.

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination and specialized operational command with authority to define integration contracts, manage adapter configurations, and coordinate cross-domain data flows.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [adapter-pattern-specialist](@/agents/adapter-pattern-specialist.md) | Adapter Design | Designs integration adapters for external systems and APIs |
| [anti-corruption-layer-specialist](@/agents/anti-corruption-layer-specialist.md) | Boundary Protection | Isolates legacy systems through anti-corruption layers |
| [data-migration-architect](@/agents/data-migration-architect.md) | Data Movement | Coordinates large-scale data migration across domain boundaries |
| [cross-domain-intelligence-coordinator](@/agents/cross-domain-intelligence-coordinator.md) | Intelligence Consumer | Consumes cross-domain data for intelligence fusion |

## Enforcement

All integration operations are governed by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. No cross-domain data flow operates without a verified integration contract. Adapters must pass compliance testing before production deployment. Event delivery guarantees are enforced through monitoring with automatic alerting when delivery failures exceed configurable thresholds. Data consistency conflicts are surfaced immediately and must be resolved before affected data can be consumed downstream. Integration contract changes require backward compatibility verification across all affected domains before deployment.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)