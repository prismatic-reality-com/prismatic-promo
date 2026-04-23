+++
title = "Microservices"
weight = 55
[extra]
category = "architecture"
description = "Architectural style decomposing applications into small, independently deployable services, each implementing a single business capability"
related_terms = ["bounded-context", "domain-driven-design", "api-gateway", "distributed-system", "umbrella-application", "circuit-breaker", "supervisor", "event-sourcing", "eventual-consistency", "cap-theorem"]
pattern_type = "architectural_style"
complexity = "very_high"
prismatic_approach = "modular_monolith_umbrella"
umbrella_apps = 115
beam_alternative = true
communication_model = "in-process function calls"
deployment_model = "single BEAM release"
otp_components = ["Supervisor", "GenServer", "Application", "Registry"]
elixir_libraries = ["Phoenix", "Ecto", "Plug"]
key_modules = ["PrismaticSupervisor", "PrismaticStorage.AdapterContractTest"]
industry_origin = "Netflix, Amazon, Spotify (2012-2014)"
predecessors = ["SOA", "ESB", "monolith"]
date_created = "2025-04-20"
date_updated = "2026-02-22"
meta_rule = "If the same solution could be written identically in Node.js, it is WRONG"
trade_off = "organizational scalability vs distributed systems complexity"
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1888
date_modified = "2026-02-23"
keywords = ["Microservices", "Architectural", "glossary", "architecture", "Prismatic Platform", "BEAM", "Service"]
tags = ["glossary", "architecture", "microservices", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Microservices - Prismatic Platform"
+++

## Definition

Microservices is an architectural style in which an application is structured as a collection of small, loosely coupled, independently deployable services, each implementing a single business capability, owning its data store, and communicating with other services through well-defined APIs (typically HTTP/REST, gRPC, or asynchronous messaging). Each service can be developed, tested, deployed, scaled, and maintained independently by a small team, enabling organizational scalability where multiple teams work on different services in parallel without tight coordination.

The microservices architecture emerged as a response to the limitations of monolithic applications, where all functionality resides in a single deployable unit. In a monolith, changes to any component require rebuilding and redeploying the entire application, scaling requires replicating the entire application even when only one component is the bottleneck, and a failure in one component can cascade to bring down the entire system. Microservices address these limitations by decomposing the monolith into independently operable units, trading the simplicity of a single deployment for the flexibility of independent lifecycle management.

However, microservices introduce substantial [distributed systems](@/glossary/distributed-system.md) complexity: network communication replaces function calls, data consistency requires distributed transactions or [eventual consistency](@/glossary/eventual-consistency.md) patterns, debugging spans multiple services, and deployment requires orchestration infrastructure (Kubernetes, service mesh). The decision between monolithic and microservice architectures is not a matter of one being superior to the other but of understanding which complexity profile better fits the organization's size, team structure, deployment requirements, and operational maturity.

## Historical Context

The term "microservices" entered common usage around 2012, though the underlying ideas drew from decades of distributed systems research and the Service-Oriented Architecture (SOA) movement of the early 2000s. James Lewis and Martin Fowler's 2014 article "Microservices: a definition of this new architectural term" provided the canonical description that the industry adopted.

Several organizational experiences catalyzed the movement. Amazon's 2002 mandate from Jeff Bezos that all teams must expose their functionality through service interfaces fundamentally restructured the company's engineering culture. Netflix's migration from a monolithic Java application to a microservices architecture (2009-2012) produced the open-source tools (Zuul, Eureka, Hystrix, Ribbon) that formed the first practical microservices toolkit. Spotify's "Squad Model" (2012) demonstrated how microservices enable organizational scaling through autonomous teams aligned to business domains.

The pattern gained mainstream adoption alongside containerization (Docker, 2013) and container orchestration (Kubernetes, 2014), which provided the deployment infrastructure that made running hundreds of services operationally feasible. The service mesh concept (Linkerd 2016, Istio 2017) added a dedicated infrastructure layer for service-to-service communication, further reducing the boilerplate each service needed to implement.

By 2020, the industry had accumulated enough experience to recognize microservices' limitations as clearly as their benefits. The "microservices premium" -- the operational tax of running distributed infrastructure -- became well-documented, and thoughtful practitioners began advocating for the "modular monolith" as a middle ground that provides modularity without distribution. This perspective aligns precisely with the Prismatic Platform's architectural approach.

## The Monolith-Microservice Spectrum

Modern architectures exist on a spectrum rather than as a binary choice:

| Architecture | Description | Deployment | Communication | Team Model |
|-------------|-------------|------------|---------------|------------|
| **Monolith** | Single deployable unit, all code in one process | One artifact | Function calls | One team or shared codebase |
| **Modular monolith** | Single deployment with strong internal module boundaries | One artifact | Function calls | Multiple teams, shared deployment |
| **Microservices** | Multiple independent deployments | Many artifacts | Network (HTTP, gRPC, messaging) | Independent teams per service |
| **Serverless** | Functions deployed individually, no server management | Per-function | Event-driven | Per-function ownership |

The Prismatic Platform occupies the "modular monolith" position, using Elixir's [umbrella application](@/glossary/umbrella-application.md) pattern to achieve microservice-like modularity within a single [BEAM](@/glossary/beam.md) deployment. Each umbrella app is an independent bounded context with its own compilation, testing, and [supervision tree](@/glossary/supervision-tree.md), but they communicate through in-process function calls rather than network APIs.

## Key Principles

| Principle | Description | Trade-off |
|-----------|-------------|----------|
| **Single responsibility** | Each service implements one business capability | More services to manage |
| **Data ownership** | Each service owns its database/storage | Cross-service queries require APIs |
| **Independent deployment** | Services deploy without coordinating with others | Version compatibility complexity |
| **Technology freedom** | Each service can use different languages/frameworks | Operational diversity overhead |
| **Resilience** | Service failure is isolated, does not cascade | Requires [circuit breakers](@/glossary/circuit-breaker.md), retries |
| **Scalability** | Scale individual services based on their load | Container orchestration overhead |
| **Decentralized governance** | Teams choose their own tools and patterns | Consistency requires conventions |
| **Design for failure** | Every service call can fail | Error handling is pervasive |

## Communication Patterns

| Pattern | Protocol | Use Case | Coupling | Latency |
|---------|----------|----------|----------|---------|
| **Synchronous REST** | HTTP/JSON | Simple CRUD, queries | Higher | Medium |
| **Synchronous gRPC** | HTTP/2 + Protobuf | Performance-critical, typed APIs | Higher | Low |
| **Async messaging** | AMQP, Kafka | Event-driven, eventual consistency | Lower | Higher |
| **[Event sourcing](@/glossary/event-sourcing.md)** | Event log | Audit trails, temporal queries | Lowest | Varies |
| **Saga pattern** | Choreography/orchestration | Distributed transactions | Medium | High |

## Service Decomposition Strategies

| Strategy | Approach | Example | Risk |
|----------|----------|---------|------|
| **By business capability** | Each service maps to a business function | Payment service, Inventory service | Anemic services |
| **By domain (DDD)** | Services align with [bounded contexts](@/glossary/bounded-context.md) | Order context, Shipping context | Over-decomposition |
| **By data ownership** | Services grouped by data domain | Customer data service, Product catalog | Data duplication |
| **Strangler fig** | Incrementally extract from monolith | Extract authentication first, then billing | Partial migration |
| **Team topology** | Services aligned to team boundaries | Conway's Law compliance | Organizational rigidity |

## Challenges of Microservices

| Challenge | Description | Mitigation |
|-----------|-------------|------------|
| **Distributed transactions** | ACID across services is extremely difficult | Saga pattern, eventual consistency |
| **Service discovery** | Services must find each other dynamically | Service registry (Consul, DNS) |
| **Data consistency** | Each service has its own data store | Event-driven synchronization |
| **Debugging** | Request spans multiple services | Distributed tracing (OpenTelemetry) |
| **Testing** | Integration testing requires running multiple services | Contract testing, consumer-driven contracts |
| **Deployment** | Coordinating many deployments | CI/CD pipelines, Kubernetes |
| **Network latency** | Every service call adds network overhead | Caching, batching, co-location |
| **Operational overhead** | Monitoring, logging, alerting for each service | Centralized observability platform |
| **Version coupling** | API changes require coordinated rollouts | Semantic versioning, backward compatibility |
| **Data duplication** | Each service materializes data it needs | Event-driven materialization, CQRS |

## The Eight Fallacies of Distributed Computing

Microservices are subject to all eight fallacies of distributed computing, formulated by Peter Deutsch and James Gosling at Sun Microsystems:

1. The network is reliable
2. Latency is zero
3. Bandwidth is infinite
4. The network is secure
5. Topology does not change
6. There is one administrator
7. Transport cost is zero
8. The network is homogeneous

Each fallacy represents a class of failures that do not exist in monolithic architectures but must be handled in microservices through retries, [circuit breakers](@/glossary/circuit-breaker.md), timeouts, encryption, service discovery, and careful capacity planning. The Prismatic Platform avoids these fallacies entirely for internal communication by keeping all services within a single BEAM node, where function calls are local, latency is microseconds, and network partitions are impossible.

## Implementation in Prismatic Platform

The Prismatic Platform takes a distinctive approach: achieving microservice-like modularity within a monolithic deployment through its Elixir umbrella architecture. This "modular monolith" pattern provides the organizational benefits of microservices without the distributed systems complexity:

```elixir
defmodule PrismaticPlatform.Application do
  @moduledoc """
  Top-level application demonstrating umbrella architecture that
  provides microservice-like modularity in a single BEAM deployment.
  Each umbrella app is an independent bounded context with explicit
  dependency declarations and its own supervision tree.

  115 umbrella apps achieve what would require 115 microservices
  in a distributed architecture -- without network overhead,
  distributed transactions, or service discovery.
  """

  use Application

  @impl Application
  @spec start(term(), term()) :: {:ok, pid()} | {:error, term()}
  def start(_type, _args) do
    children = [
      {PrismaticStorageCore.Supervisor, []},
      {PrismaticStorage.Supervisor, []},
      {PrismaticAgents.Supervisor, []},
      {PrismaticPerimeter.Supervisor, []},
      {PrismaticVisitorIntelligence.Supervisor, []},
      {PrismaticSafety.Supervisor, []},
      {PrismaticWeb.Supervisor, []},
      {PrismaticApi.Supervisor, []}
    ]

    Supervisor.start_link(children, strategy: :one_for_one)
  end
end
```

### Umbrella vs Microservices Comparison

| Aspect | Prismatic Umbrella (115 apps) | Traditional Microservices |
|--------|-------------------------------|--------------------------|
| **Deployment** | Single BEAM release | Multiple containers/services |
| **Communication** | Function calls (in-process) | HTTP/gRPC/messaging (network) |
| **Data sharing** | Shared PostgreSQL with schema boundaries | Database per service |
| **Latency** | Microseconds (function call) | Milliseconds (network) |
| **Transactions** | ACID across apps (same DB) | Saga/eventual consistency |
| **Failure isolation** | [OTP](@/glossary/otp.md) supervision trees | Service mesh, circuit breakers |
| **Independent testing** | Each app compilable/testable alone | Each service runnable alone |
| **Dependency management** | mix.exs declares inter-app deps | API contracts, versioning |
| **Team boundaries** | App ownership (same repo) | Service ownership (separate repos) |
| **Operational cost** | Single deployment to manage | N deployments to manage |
| **Hot code reload** | Native BEAM capability | Rolling restart required |
| **Shared libraries** | Direct dependency in mix.exs | Published package or git submodule |

### Why Umbrella Over Microservices

```elixir
defmodule Prismatic.ArchitecturalPhilosophy do
  @moduledoc """
  The meta-rule that guides Prismatic's architecture:
  "If the same solution could be written identically in Node.js, it is WRONG."

  Microservices + REST is the Node.js way.
  OTP umbrella + supervision is the Elixir/OTP way.
  The BEAM provides the process isolation, fault tolerance, and
  distribution primitives that microservices frameworks simulate.
  """

  @spec why_not_microservices() :: {:ok, [String.t()]}
  def why_not_microservices do
    reasons = [
      "BEAM processes provide isolation without network overhead",
      "Supervision trees provide fault recovery without service mesh",
      "Message passing provides async communication without message brokers",
      "Distribution provides cross-node deployment without Kubernetes",
      "Hot code reload provides zero-downtime updates without rolling restarts",
      "ETS provides shared state without Redis or distributed caches",
      "Umbrella apps provide bounded contexts without separate repositories"
    ]

    {:ok, reasons}
  end
end
```

The [BEAM](@/glossary/beam.md) virtual machine provides most of what microservices architectures simulate through external infrastructure. Process isolation provides failure boundaries, [supervision trees](@/glossary/supervision-tree.md) provide automatic recovery, message passing provides asynchronous communication, and distribution provides cross-node deployment. Layering HTTP-based microservices on top of the BEAM means paying the distributed systems tax without receiving its benefits.

## When Microservices Are Appropriate

Despite the Prismatic Platform's umbrella approach, microservices remain the right choice in specific organizational and technical contexts:

| Context | Why Microservices Fit |
|---------|----------------------|
| **Large organization (100+ engineers)** | Teams need deployment independence to avoid coordination overhead |
| **Polyglot requirements** | Different services need different languages (ML in Python, API in Go) |
| **Independent scaling** | One component receives 100x the traffic of others |
| **Regulatory isolation** | PCI/HIPAA components must be physically separated |
| **Acquisition integration** | Acquired systems need loose coupling during integration |
| **Team autonomy** | Conway's Law alignment requires service boundaries matching team boundaries |

The key insight is that microservices solve organizational scaling problems, not technical ones. If your team is small enough to coordinate deployments and your technology stack is uniform, microservices add complexity without corresponding benefit.

## Comparison with Alternatives

| Architecture | Best For | Team Size | Operational Maturity | Prismatic Relevance |
|-------------|----------|-----------|---------------------|---------------------|
| **Monolith** | Small teams, early stage | 1-10 | Low | Starting point |
| **Modular monolith (umbrella)** | Medium teams, BEAM/OTP | 5-50 | Medium | **Current architecture** |
| **Microservices** | Large organizations, polyglot | 50+ | High | Not needed (BEAM handles it) |
| **Serverless** | Event-driven, variable load | Any | Low (managed) | Complementary for specific tasks |
| **Service mesh** | Microservices with advanced networking | 50+ | Very high | Unnecessary with OTP |

## Best Practices

1. **Start Monolithic, Extract When Needed**: Do not begin with microservices. Start with a well-structured monolith (or umbrella), and extract services only when organizational scaling demands it. Premature decomposition creates complexity without benefit.

2. **Define Clear Boundaries First**: Whether using microservices or umbrella apps, establish [bounded contexts](@/glossary/bounded-context.md) before writing code. Each boundary should encapsulate a cohesive business capability with a well-defined API. The Prismatic Platform's 115 umbrella apps each represent a distinct bounded context.

3. **Prefer In-Process Communication**: When services run on the same platform (BEAM), prefer function calls over network communication. Network calls add latency, failure modes, and serialization overhead that in-process calls avoid.

4. **Use OTP for What Microservices Promise**: Process isolation, [supervision trees](@/glossary/supervision-tree.md), hot code reload, and distributed Erlang provide the benefits that microservices architectures simulate. Use the platform's native capabilities rather than reimplementing them through infrastructure.

5. **Accept the Trade-offs Consciously**: If you choose microservices, accept the full complexity cost: distributed tracing, service discovery, circuit breakers, eventual consistency, contract testing, and deployment orchestration. Partial adoption leads to the worst of both worlds.

6. **Monitor the Tax**: Track the operational overhead of your architecture. If your team spends more time managing infrastructure than building features, your architecture is too complex for your organization's maturity.

## Use Cases in Prismatic

- **Umbrella Application Architecture**: The Prismatic Platform's 115 umbrella applications demonstrate how microservice-like modularity is achieved within a monolithic BEAM deployment, with each app maintaining independent compilation, testing, and supervision.

- **[API Gateway](@/glossary/api-gateway.md) Pattern**: The `prismatic_api` application functions as an API gateway, exposing internal umbrella app functionality through a unified REST interface -- a pattern borrowed from microservices architecture.

- **Storage Adapter Abstraction**: The [adapter pattern](@/glossary/adapter-pattern.md) across 7 storage backends (ETS, Ecto, Meilisearch, KuzuDB, DuckDB, Redis, PostgreSQL) provides the data isolation that microservices achieve through database-per-service, but without network overhead.

- **Agent Specialization**: The 530 AIAD agents operate as specialized units with defined responsibilities, communicating through message passing -- achieving the single-responsibility principle of microservices through OTP processes.

## Related Concepts

- [Bounded Context](@/glossary/bounded-context.md) - DDD concept mapped to service or umbrella app boundaries
- [Domain-Driven Design](@/glossary/domain-driven-design.md) - Methodology informing service decomposition
- [API Gateway](@/glossary/api-gateway.md) - Entry point for external access to services
- [Umbrella Application](@/glossary/umbrella-application.md) - Elixir mechanism providing microservice modularity
- [Distributed System](@/glossary/distributed-system.md) - Architecture pattern that microservices create
- [Circuit Breaker](@/glossary/circuit-breaker.md) - Resilience pattern essential in microservices
- [Supervisor](@/glossary/supervisor.md) - OTP alternative to microservice fault isolation
- [Event Sourcing](@/glossary/event-sourcing.md) - Data pattern enabling microservice data independence
- [CAP Theorem](@/glossary/cap-theorem.md) - Fundamental constraint governing distributed data
- [Eventual Consistency](@/glossary/eventual-consistency.md) - Data model required by microservice data ownership

## See Also

- [Architecture](@/architecture/_index.md) - Platform architecture and umbrella vs microservices analysis
- [Apps](@/apps/_index.md) - Catalog of 115 umbrella applications
- [Technologies](@/technologies/_index.md) - Technology stack and architectural patterns

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
