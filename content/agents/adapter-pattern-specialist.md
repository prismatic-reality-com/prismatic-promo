+++
title = "adapter-pattern-specialist"
weight = 16
[extra]
domain = "integration"
level = "L3"
description = "Integration adapter design for external systems and APIs with hexagonal architecture enforcement"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "telemetry", "mycelial-network", "ecto", "circuit-breaker", "genserver", "behaviour"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1750
quality_score = 92
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["adapter-pattern-specialist", "Integration", "APIs", "agents", "agent", "Prismatic Platform", "The Adapter", "Pattern Specialist", "Circuit"]
tags = ["agents", "agent", "adapter-pattern-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "adapter-pattern-specialist - Prismatic Platform"
+++

## Overview

The [Adapter Pattern](/glossary/adapter-pattern/) Specialist operates as an L3 [strategic command](/glossary/strategic-command/) agent within the Integration domain of the Prismatic Platform. This agent is responsible for designing, implementing, and maintaining adapter layers that connect the platform's internal systems to external APIs, third-party services, and legacy infrastructure. Every adapter follows the hexagonal architecture principle: business logic remains isolated from transport concerns, and external system details never leak into core domain models.

In a platform with 90 [umbrella application](/glossary/umbrella-application/)s and hundreds of external integration points, adapter consistency is not optional. The Adapter Pattern Specialist enforces standardized contract interfaces across all integration boundaries, ensuring that [protocol](/glossary/protocol/) buffers, REST clients, webhook receivers, and message queue consumers all conform to the same behavioral contract patterns. This includes proper error handling with `{:ok, _}` / `{:error, _}` tuples, [circuit breaker](/glossary/circuit-breaker/) integration, and retry semantics defined at the adapter boundary.

The hexagonal architecture (also known as ports and adapters) is not merely a design preference within the Prismatic Platform -- it is an enforced architectural constraint. The distinction between a "port" (an interface that the domain exposes or consumes) and an "adapter" (a concrete implementation that connects a port to an external system) must be maintained in every integration. This enforcement ensures that the platform's core intelligence processing remains independent of any specific external provider, enabling zero-downtime provider switches, comprehensive testing without live dependencies, and clean separation of domain evolution from infrastructure evolution.

## Operational Domain

The Integration domain governs all boundary-crossing communication within the Prismatic ecosystem. This includes inbound data ingestion from [OSINT](/glossary/osint/) providers, outbound API calls to cloud services, event-driven synchronization between umbrella applications, and protocol translation for legacy system interoperability. The Adapter Pattern Specialist serves as the primary architect for these boundaries.

The scope of integration management extends across transport protocols (HTTP, WebSocket, gRPC, AMQP), data formats (JSON, XML, Protocol Buffers, CSV), authentication mechanisms (OAuth 2.0, API keys, mutual TLS), and communication patterns (synchronous request-response, asynchronous event-driven, streaming). Each dimension introduces failure modes that the adapter layer must handle transparently to domain consumers.

## Key Capabilities

- **Hexagonal adapter design** with strict port-and-adapter separation that prevents external system concerns from contaminating domain logic, enabling swap-in replacement of any external dependency without modifying business logic
- **Contract-first interface specification** using [Elixir](/glossary/elixir/) [behaviours](/glossary/behaviour/) and typespecs to define adapter contracts before implementation, ensuring compile-time verification of all integration points and enabling mock-based testing
- **Circuit breaker integration** with automatic fallback strategies, [connection pooling](/glossary/connection-pooling/), and [backpressure](/glossary/backpressure/) management for resilient external system communication, preventing cascading failures from propagating into core domain logic
- **Protocol translation layers** that normalize data formats across REST, [GraphQL](/glossary/graphql/), gRPC, and message queue protocols into consistent internal representations with explicit schema versioning
- **Adapter testing frameworks** providing mock adapters, contract test suites, and integration test harnesses that validate adapter behavior without requiring live external systems
- **Connection lifecycle management** handling connection pooling, keepalive strategies, automatic reconnection, and graceful degradation when external systems become unavailable

## Technical Architecture

The Adapter Pattern Specialist enforces a layered architecture where every external integration follows the same structural pattern. At the core is the [behaviour](/glossary/behaviour/) definition that establishes the contract. Concrete adapters implement this behaviour for specific external systems.

```elixir
defmodule PrismaticStorageCore.Adapter do
  @moduledoc "Base behaviour for all storage adapters."

  @callback store(key :: term(), value :: term(), opts :: keyword()) ::
    {:ok, term()} | {:error, term()}

  @callback fetch(key :: term(), opts :: keyword()) ::
    {:ok, term()} | {:error, :not_found | term()}

  @callback delete(key :: term(), opts :: keyword()) ::
    {:ok, term()} | {:error, term()}

  @callback health_check() :: :ok | {:error, term()}
end

defmodule PrismaticStorage.Adapters.ETS do
  @behaviour PrismaticStorageCore.Adapter

  @impl true
  def store(key, value, opts) do
    table = Keyword.get(opts, :table, :default_store)
    :ets.insert(table, {key, value, System.monotonic_time()})
    {:ok, key}
  end

  @impl true
  def fetch(key, opts) do
    table = Keyword.get(opts, :table, :default_store)
    case :ets.lookup(table, key) do
      [{^key, value, _ts}] -> {:ok, value}
      [] -> {:error, :not_found}
    end
  end
end
```

Every adapter module must implement the full behaviour contract. The `@impl true` annotation is mandatory -- it enables the Elixir compiler to verify at compile time that all required callbacks are implemented. Missing implementations produce compilation errors, not runtime failures. This compile-time guarantee is a direct enforcement of the NO MERCY doctrine: incomplete adapters cannot exist in the codebase.

Circuit breaker integration wraps every adapter call through a middleware layer that tracks failure rates and trips the breaker when the error threshold is exceeded. The [circuit breaker](/glossary/circuit-breaker/) pattern uses three states: closed (normal operation), open (all calls fail immediately), and half-open (limited calls allowed to test recovery). State transitions are managed through a dedicated [GenServer](/glossary/genserver/) per adapter, with configurable failure thresholds and recovery windows.

Connection pooling for HTTP-based adapters uses a pool supervisor that maintains a configurable number of persistent connections per external endpoint. Pool exhaustion triggers backpressure signals to consuming processes rather than spawning unbounded connections, preventing resource exhaustion under load spikes.

## Decision Framework

The Adapter Pattern Specialist's decisions center on adapter design choices that balance reliability, performance, and maintainability.

| Decision Point | Options | Selection Criteria |
|---------------|---------|-------------------|
| Communication pattern | Sync / Async / Stream | Latency requirements, data volume, backpressure needs |
| Error handling | Retry / Circuit break / Fallback | Failure mode, idempotency, SLA requirements |
| Data format | JSON / Protobuf / Custom | Performance needs, schema evolution, interoperability |
| Connection management | Pool / Per-request / Persistent | Throughput requirements, external system limits |
| Testing strategy | Mock / Contract / Integration | Development phase, CI/CD stage, deployment target |

Adapter complexity thresholds determine when a simple adapter is sufficient versus when the full circuit breaker, retry, and fallback infrastructure is required. Adapters to internal platform services (inter-app communication) use lightweight direct calls. Adapters to external third-party APIs use the complete resilience stack. Adapters to mission-critical external systems (compliance databases, security feeds) add redundant provider failover.

## Authority Level

**L3** - Strategic Command. The Adapter Pattern Specialist holds multi-domain coordination authority for all integration boundary design decisions. This authority permits the agent to review and reject adapter implementations across any umbrella application that do not conform to the hexagonal architecture standard. The agent can mandate structural changes to adapters even in applications owned by other domain teams when those adapters violate platform-wide integration standards.

The authority scope includes defining the canonical adapter contract patterns, maintaining the shared adapter behaviour library in `prismatic_storage_core`, and approving or rejecting new external integration proposals based on architectural fitness.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [anti-corruption-layer-specialist](/agents/anti-corruption-layer-specialist/) | Peer Specialist | Coordinates legacy system isolation patterns with adapter boundaries |
| [cross-domain-integration-orchestrator](/agents/cross-domain-integration-orchestrator/) | Strategic Partner | Routes cross-domain integration requests through proper adapter channels |
| [data-migration-architect](/agents/data-migration-architect/) | Data Consumer | Provides adapter interfaces for migration [data pipeline](/glossary/data-pipeline/)s |
| [aiad-verification-engine](/agents/aiad-verification-engine/) | Contract Validator | Validates adapter behaviour compliance and contract completeness |
| [alert-management-specialist](/agents/alert-management-specialist/) | Failure Router | Receives circuit breaker trip notifications for operator alerting |

## Performance Characteristics

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| **Adapter contract compliance** | 100% | 100% | All adapters implement required behaviours |
| **Circuit breaker coverage** | > 95% | 100% | External adapters with circuit breaker protection |
| **Connection pool efficiency** | > 90% | > 85% | Pool utilization rate under normal load |
| **Adapter test coverage** | > 90% | > 95% | Contract and integration test coverage |
| **Mean adapter latency overhead** | < 5ms | < 10ms | Overhead added by adapter layer vs direct call |
| **Provider switch time** | < 30min | < 1hr | Time to swap adapter implementation for a port |

## Enforcement

All adapter implementations are governed by the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. Every adapter must pass contract verification tests, maintain zero compilation warnings, and include comprehensive typespecs. Adapters without proper error handling tuples or missing circuit breaker integration are rejected at the quality gate. No adapter ships without evidence that it handles all failure modes documented in the integration contract. The `@impl true` annotation is mandatory on every callback implementation -- adapters lacking this annotation fail [Credo](/glossary/credo/) strict checks. Direct external system calls bypassing the adapter layer are detected by static analysis and blocked as L2 violations.

## Related Resources

- [Adapter Pattern](/glossary/adapter-pattern/) -- Glossary entry for the hexagonal architecture pattern
- [Anti-Corruption Layer](/agents/anti-corruption-layer-specialist/) -- Complementary pattern for legacy system isolation
- [AIAD Standard](/capabilities/aiad-standard/) -- Agent specification standard including adapter components
- [Architecture Overview](/architecture/) -- Platform architecture patterns
- [Technologies](/technologies/) -- Platform technology stack
- [Applications](/apps/) -- 90+ applications using adapter patterns

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)