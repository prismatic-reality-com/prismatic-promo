+++
title = "service-mesh-specialist"
weight = 366
[extra]
domain = "integration"
level = "L3"
description = "Service-to-service communication architecture, observability, and traffic management across the OTP ecosystem"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "seadf", "telemetry"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2300
quality_score = 87
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["service-mesh-specialist", "Service-to-service", "agents", "agent", "Prismatic Platform", "Process", "GenServer"]
tags = ["agents", "agent", "service-mesh-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "service-mesh-specialist - Prismatic Platform"
+++

## Overview

The service-mesh-specialist operates as an L3 [Strategic Command](/glossary/strategic-command/) authority within the Prismatic Platform's integration domain, governing service-to-service communication architecture, traffic management, and inter-process [observability](/glossary/observability/) across the platform's 90-application umbrella. In an [OTP](/glossary/otp/) ecosystem with hundreds of [GenServers](/glossary/genserver/), supervisors, and distributed processes, reliable inter-service communication is foundational to platform stability. This agent designs and enforces communication patterns that ensure message delivery guarantees, load distribution, fault isolation, and end-to-end request tracing.

Built on the [AIAD](/glossary/aiad/) standard, the service-mesh-specialist applies OTP-native communication patterns rather than importing external service mesh frameworks such as Istio or Linkerd. The [BEAM](/glossary/beam/) virtual machine provides built-in primitives for service mesh functionality that external frameworks replicate at higher cost: process [registry](/glossary/registry-otp/) management enables service discovery, process groups support load balancing, monitors provide health checking, and [telemetry](/glossary/telemetry/)-instrumented [message passing](/glossary/message-passing/) provides distributed tracing. The [NO MERCY](/glossary/no-mercy/) doctrine mandates that every inter-service call path has defined timeout behavior, [backpressure](/glossary/backpressure/) handling, and failure recovery -- no fire-and-forget messaging is permitted for operations that affect system state.

## Operational Domain

The service mesh domain encompasses process discovery, message routing, [load balancing](/glossary/load-balancing/) across process pools, [circuit breaker](/glossary/circuit-breaker/) management, and [distributed tracing](/glossary/distributed-tracing/) instrumentation. The agent manages the communication topology between platform applications, ensuring that service boundaries are respected and that cross-application calls use defined interfaces rather than direct process references. Traffic management policies govern [rate limiting](/glossary/rate-limiting/), request prioritization, and graceful degradation during partial system outages.

The domain also covers the communication patterns between the platform's different runtime environments: the main Phoenix web application (port 4000), the API gateway (port 4004), background processing workers, and scheduled task executors. Each environment has different latency tolerances, throughput requirements, and failure handling characteristics that the service mesh must accommodate.

## Key Capabilities

- **Process registry management** -- Maintains service discovery infrastructure using [ETS](/glossary/ets/)-backed registries and process groups, enabling location-transparent communication across the [umbrella application](/glossary/umbrella-application/). Service registration is automatic at process startup and deregistration occurs through monitor-triggered cleanup
- **Circuit breaker orchestration** -- Configures and monitors circuit breakers on inter-service call paths, preventing cascading failures when downstream services experience degradation. Circuit breaker states (closed, open, half-open) are tracked in ETS for low-latency access
- **Distributed tracing** -- Instruments request flows with correlation identifiers that propagate across process boundaries, enabling end-to-end latency analysis and bottleneck identification through [telemetry](/glossary/telemetry/) events
- **[Backpressure](/glossary/backpressure/) enforcement** -- Implements producer-consumer rate management to prevent fast producers from overwhelming slow consumers, using OTP-native demand-driven patterns including GenStage-style demand signaling
- **Traffic shaping** -- Manages request prioritization and rate limiting at service boundaries, ensuring that high-priority operations (security events, health checks) receive preferential treatment during load spikes
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with self-healing communication path recovery when service topology changes
- **[SEADF](/glossary/seadf/) integration** for evolutionary optimization of traffic routing patterns based on observed latency distributions

## OTP-Native Service Mesh Architecture

The platform's service mesh leverages BEAM primitives rather than external infrastructure, providing tighter integration with the application runtime and eliminating the operational complexity of sidecar proxies.

| Traditional Service Mesh | OTP-Native Equivalent | Advantage |
|-------------------------|----------------------|-----------|
| Service discovery (Consul, etcd) | Process registry (Registry, :pg) | Zero external dependencies, process-level granularity |
| Load balancing (Envoy) | Process groups with selection strategies | Built into runtime, microsecond overhead |
| Circuit breakers (Hystrix) | GenServer-based state machines | Integrated with supervision tree recovery |
| Distributed tracing (Jaeger) | Telemetry span propagation | Zero-copy context propagation through process mailboxes |
| Health checking (gRPC) | Process monitors and supervision | Automatic detection, sub-millisecond notification |
| Rate limiting (Token bucket) | GenServer-based rate limiters | ETS-backed for concurrent access |

## Communication Patterns

The agent enforces specific communication patterns based on the relationship between communicating services.

| Pattern | Use Case | Implementation | Guarantees |
|---------|----------|---------------|------------|
| **Request-Reply** | Synchronous queries | GenServer.call with timeout | At-most-once, timeout bounded |
| **Fire-and-Confirm** | Asynchronous commands | GenServer.cast + confirmation message | At-least-once with retry |
| **Pub-Sub** | Event broadcasting | Phoenix.PubSub + Registry | Best-effort, ordered per publisher |
| **Pipeline** | Data transformation chains | GenStage demand-driven flow | Backpressure-managed throughput |
| **Scatter-Gather** | Parallel aggregation | Task.async_stream with timeout | Partial results on timeout |

## Authority Level

**L3** - Strategic Command - Multi-domain coordination with authority to enforce communication standards and service boundary definitions across all platform applications. The agent can mandate communication pattern changes that affect inter-application interfaces.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/service-mesh status` | Display communication topology health and circuit breaker states | L3+ |
| `/service-mesh trace <request>` | Initiate distributed trace for a specified request path | L3+ |
| `/service-mesh audit` | Audit service boundary compliance and communication pattern adherence | L3+ |
| `/service-mesh topology` | Visualize current service communication topology | L2+ |
| `/service-mesh breakers` | List all circuit breakers with current states and trip history | L2+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [platform-integration-specialist](/agents/platform-integration-specialist/) | Manages external integration traffic that enters the service mesh |
| [performance-profiling-agent](/agents/performance-profiling-agent/) | Consumes distributed trace data for performance bottleneck analysis |
| [Performance Benchmarking Agent](/agents/performance-benchmarking-agent/) | Validates that mesh overhead stays within acceptable latency budgets |
| [security-operations-specialist](/agents/security-operations-specialist/) | Security monitoring of inter-service communication for anomaly detection |

## Observability Integration

The service mesh generates comprehensive observability data that feeds into the platform's monitoring infrastructure.

| Metric Category | Examples | Telemetry Namespace |
|----------------|---------|-------------------|
| **Latency** | Request duration, queue wait time, processing time | `:prismatic, :mesh, :latency` |
| **Throughput** | Messages per second, bytes transferred, request counts | `:prismatic, :mesh, :throughput` |
| **Errors** | Timeout rates, circuit breaker trips, message drops | `:prismatic, :mesh, :errors` |
| **Saturation** | Mailbox depths, pool utilization, backpressure events | `:prismatic, :mesh, :saturation` |

## Enforcement

The [NO MERCY](/glossary/no-mercy/) doctrine requires that all inter-service calls have explicit timeout definitions, circuit breaker configurations, and error handling paths. No direct process references across application boundaries are permitted -- all communication must flow through registered service interfaces. All communication paths must be instrumented with [telemetry](/glossary/telemetry/) spans for observability compliance. Services that violate mesh policies receive L2 violation notices, and repeated violations trigger architectural review by the L1 infrastructure authority.

## Related Agents

Agents in the **integration** domain collaborate with the service-mesh-specialist to maintain reliable, observable communication across the platform. The agent ensures that the 90-application umbrella operates as a cohesive distributed system rather than a collection of independent processes communicating through ad-hoc patterns.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)