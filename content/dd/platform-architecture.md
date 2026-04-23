+++
title = "Platform Architecture and Technical Implementation"
weight = 100
date = "2026-02-17"

[extra]
tags = ["architecture", "elixir", "otp", "phoenix", "liveview", "technical", "implementation", "due-diligence"]
icon = "cpu-chip"
color = "gray"
description = "Technical architecture of the DD Intelligence platform built on Elixir/OTP with Phoenix LiveView, PostgreSQL, KuzuDB, Meilisearch, and 122 concurrent OSINT pipelines"
category = "technical"
status = "active"
author = "Tomáš Korcak (korczis)"
reading_time = "14 min"
word_count = 2500
difficulty = "advanced"
image = "/images/dd/platform-architecture.png"
image_alt = "DD platform technical architecture on Elixir/OTP stack"
og_type = "article"
twitter_card = "summary_large_image"
academic_tier = "whitepaper"
content_version = "1.0.0"
last_enhanced = "2026-02-17"
quality_score = 91
see_also = ["entity-management", "osint-integration", "graph-analysis", "case-management"]
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Platform", "Architecture", "Technical", "Implementation", "Intelligence", "ElixirOTP", "Phoenix", "LiveView", "PostgreSQL", "Prismatic Platform"]
+++

## Abstract

The Prismatic DD Intelligence platform is implemented as a set of [Elixir](/glossary/elixir/)/[OTP](/glossary/otp/) applications within the Prismatic umbrella, leveraging the [BEAM](/glossary/beam/) virtual machine's strengths in concurrent processing, fault tolerance, and distributed state management. The architecture comprises six primary application modules coordinated through OTP [supervision trees](/glossary/supervision-tree/), message passing, and [PubSub](/glossary/pubsub/) event distribution. This document describes the technical architecture, the role of each application module, the concurrency model, the polyglot persistence strategy, the real-time interface layer, and the deployment infrastructure that supports production DD investigations.

## Introduction

### Why Elixir/OTP for Due Diligence

Due diligence platforms impose specific technical requirements that align well with the Elixir/OTP technology stack:

1. **Massive Concurrency**: An investigation may query 122 OSINT sources simultaneously for dozens of entities. The BEAM VM supports millions of lightweight processes, enabling truly parallel collection without thread pool limitations.

2. **Fault Tolerance**: Individual OSINT source failures must not crash the investigation. OTP supervision trees automatically restart failed processes, and the "let it crash" philosophy enables graceful degradation when external sources are unavailable.

3. **Real-Time Updates**: Analysts need to see investigation progress in real-time as sources return data. [Phoenix LiveView](/glossary/liveview/) provides server-rendered real-time UI updates over WebSockets without JavaScript framework complexity.

4. **Long-Running Processes**: Investigations may span hours or days, with data collection happening in the background. OTP [GenServer](/glossary/genserver/) processes maintain investigation state across long-lived operations.

5. **Hot Code Upgrades**: Production investigations must not be interrupted by platform updates. The BEAM VM supports [hot code reloading](/glossary/hot-code-reload/), enabling zero-downtime deployments.

### Architecture Overview

```
                                    Phoenix LiveView (Port 4000)
                                           |
                            +--------------+--------------+
                            |              |              |
                     Case Manager    Entity Manager   Report Generator
                            |              |              |
                     +------+------+   +---+---+     +---+---+
                     |             |   |       |     |       |
                  Workflow      Access |    Graph     Template
                  Engine       Control|    Engine     Engine
                                      |       |
                            +---------+-+   +-+--------+
                            |           |   |          |
                      PostgreSQL   Meilisearch   KuzuDB
                            |
              +-------------+-------------+
              |             |             |
        OSINT Engine   Validation    Risk Scoring
              |          Engine         Engine
              |
    +---------+---------+
    |    |    |    |    |
  Src1 Src2 Src3 ... Src122
```

## Application Modules

### prismatic_dd -- Core Business Logic

The central application module containing the DD-specific domain logic, coordination, and workflow orchestration.

**Key Responsibilities**:
- Case lifecycle management and state machine
- Investigation workflow engine with task prioritization
- Entity-level business rules (validation requirements, enrichment triggers)
- Risk assessment computation and aggregation
- Report generation coordination

**OTP Architecture**:

```
prismatic_dd Application
  |
  +-- DD.Supervisor (Application supervisor)
       |
       +-- DD.CaseRegistry (Registry of active cases)
       |
       +-- DD.WorkflowEngine (Task scheduling and execution)
       |
       +-- DD.RiskEngine (Risk computation workers)
       |
       +-- DD.ReportEngine (Report generation pipeline)
       |
       +-- DD.MonitoringSupervisor (Post-deal monitoring)
            |
            +-- DD.Monitor (per-entity monitoring process)
```

Each active investigation case is represented by a GenServer process that maintains the case state, tracks task completion, and coordinates with other subsystems. This per-case process model enables hundreds of concurrent investigations without shared state conflicts.

### prismatic_osint_core -- OSINT Framework

The [OSINT integration framework](/dd/osint-integration/) providing the source behaviour contract, collection engine, and normalization pipeline.

**Key Responsibilities**:
- Source adapter registration and discovery
- [Broadway](/glossary/broadway/)-based parallel collection engine
- Per-source rate limiting through token bucket algorithms
- Response normalization and Finding struct construction
- Source health monitoring and degradation handling

**Concurrency Model**:

The OSINT collection engine operates as a Broadway pipeline with configurable concurrency per source:

```elixir
defmodule PrismaticOsintCore.CollectionPipeline do
  use Broadway

  def start_link(opts) do
    Broadway.start_link(__MODULE__,
      name: __MODULE__,
      producer: [
        module: {PrismaticOsintCore.QueryProducer, opts},
        concurrency: 1
      ],
      processors: [
        default: [concurrency: 50]
      ],
      batchers: [
        normalization: [concurrency: 10, batch_size: 100]
      ]
    )
  end
end
```

The pipeline supports up to 50 concurrent source queries, with 10 concurrent normalization workers processing results in batches. Back-pressure from slow sources automatically throttles upstream query generation, preventing memory exhaustion during large-scale collection operations.

### prismatic_osint_sources -- Source Adapters

The 122 individual OSINT source adapter implementations, each in its own module within the `PrismaticOsintSources` namespace.

**Module Organization**:

```
prismatic_osint_sources/
  lib/
    prismatic_osint_sources/
      czech/
        ares.ex
        justice_cz.ex
        isir.ex
        rzp.ex
        cuzk.ex
        registr_smluv.ex
        ...
      infrastructure/
        shodan.ex
        censys.ex
        security_trails.ex
        ...
      threat/
        virus_total.ex
        alienvault_otx.ex
        ...
      financial/
        open_corporates.ex
        sec_edgar.ex
        ...
      compliance/
        ofac.ex
        eu_sanctions.ex
        un_sanctions.ex
        ...
```

Each adapter module implements the `PrismaticOsintCore.Behaviours.Source` [behaviour](/glossary/behaviour/) and contains all source-specific logic: API client, response parser, schema mapper, and rate limit configuration.

### prismatic_storage_kuzudb -- Graph Engine

The [KuzuDB](/glossary/kuzudb/) integration providing graph storage and traversal for entity relationships.

**Key Capabilities**:
- Property graph storage for entities and relationships
- Multi-hop traversal queries with variable-depth paths
- Temporal edge properties for point-in-time analysis
- Community detection and centrality algorithms
- Graph export for visualization and reporting

**Integration Pattern**:

```elixir
defmodule PrismaticStorageKuzudb.GraphClient do
  @behaviour PrismaticStorageCore.Traits.GraphStore

  def create_relationship(from_entity, to_entity, type, properties) do
    cypher = """
    MATCH (a:Entity {id: $from_id}), (b:Entity {id: $to_id})
    CREATE (a)-[r:#{type} $props]->(b)
    RETURN r
    """
    execute_query(cypher, %{
      from_id: from_entity.id,
      to_id: to_entity.id,
      props: properties
    })
  end

  def traverse_ownership_chain(entity_id, max_depth) do
    cypher = """
    MATCH path = (start:Entity {id: $id})<-[:OWNS*1..#{max_depth}]-(owner)
    WHERE owner:Person OR NOT exists((owner)<-[:OWNS]-())
    RETURN path
    """
    execute_query(cypher, %{id: entity_id})
  end
end
```

### prismatic_storage_meilisearch -- Search Engine

[Meilisearch](/glossary/meilisearch/) integration providing full-text search across entity data.

**Key Capabilities**:
- Typo-tolerant, real-time search across entity names, addresses, and descriptions
- Faceted filtering by entity type, case, confidence level, and risk grade
- Asynchronous index updates from PostgreSQL change events
- Sub-50ms query response for interactive search

### prismatic_web -- LiveView Interface

The [Phoenix LiveView](/glossary/liveview/) interface providing real-time investigative dashboards.

**Key Pages**:

| Route | Component | Description |
|-------|-----------|-------------|
| `/dd/cases` | CasesLive | Case list with search, filter, and status overview |
| `/dd/cases/:id` | CaseDetailLive | Case detail with entity list, tasks, timeline |
| `/dd/entities/:id` | EntityDetailLive | Entity profile with source data, confidence scores |
| `/dd/graph/:case_id` | GraphVisualizationLive | Interactive relationship graph visualization |
| `/dd/risk/:entity_id` | RiskAssessmentLive | Seven-dimension risk dashboard |
| `/dd/reports/:case_id` | ReportBuilderLive | Report generation and preview |

**Real-Time Updates**:

LiveView components subscribe to [PubSub](/glossary/pubsub/) events from the DD subsystem, receiving real-time notifications when:

- Entity enrichment completes (new source data available)
- Cross-validation produces new confidence scores
- Graph expansion discovers new entities
- Risk scores are computed or updated
- Task status changes

This enables analysts to observe investigation progress in real-time without polling or page refreshes.

## Polyglot Persistence Strategy

The platform's data storage architecture leverages three specialized storage engines, each optimized for specific access patterns:

| Engine | Role | Access Pattern | Data |
|--------|------|---------------|------|
| **[PostgreSQL](/glossary/postgresql/)** | System of record | Transactional CRUD, complex queries | Entity records, case data, audit trail |
| **[KuzuDB](/glossary/kuzudb/)** | Graph traversal | Multi-hop relationship queries | Entity relationships, ownership chains |
| **[Meilisearch](/glossary/meilisearch/)** | Full-text search | Typo-tolerant search, faceted filtering | Entity names, addresses, descriptions |

Data flows from PostgreSQL (primary) to KuzuDB and Meilisearch (secondary) through asynchronous event propagation:

```
Write Path:  Application --> PostgreSQL --> PubSub Event
                                              |
                              +---------------+---------------+
                              |                               |
                         KuzuDB Sync                    Meilisearch Sync
                      (graph update)                   (index update)
```

This architecture ensures that PostgreSQL remains the single source of truth while enabling specialized query capabilities through secondary stores.

## Concurrency and Fault Tolerance

### Supervision Tree Design

The DD subsystem's supervision tree follows OTP best practices with isolated failure domains:

```
DD.Application
  |
  +-- DD.Supervisor (one_for_one)
       |
       +-- DD.CaseRegistry (permanent)
       |
       +-- DD.WorkflowSupervisor (one_for_one)
       |    |
       |    +-- DD.WorkflowEngine (permanent)
       |    +-- DD.TaskWorkerPool (simple_one_for_one, dynamic workers)
       |
       +-- DD.OsintSupervisor (rest_for_one)
       |    |
       |    +-- OsintCore.SourceRegistry (permanent)
       |    +-- OsintCore.CollectionPipeline (permanent)
       |    +-- OsintCore.HealthMonitor (permanent)
       |
       +-- DD.StorageSupervisor (one_for_one)
       |    |
       |    +-- StorageKuzudb.Client (permanent)
       |    +-- StorageMeilisearch.Client (permanent)
       |
       +-- DD.MonitoringSupervisor (simple_one_for_one)
            |
            +-- DD.Monitor (per-entity, dynamic)
```

**Failure Isolation**: If the KuzuDB client crashes, only the storage supervisor restarts it. Active OSINT collection continues, and PostgreSQL writes are unaffected. If an individual source adapter crashes during a query, only that query fails; other concurrent source queries continue.

### Back-Pressure Management

The system implements back-pressure at multiple levels to prevent resource exhaustion:

1. **Broadway pipeline**: Automatically throttles query production when processors are saturated
2. **Per-source rate limiters**: Prevent exceeding external API limits
3. **Database connection pools**: [Connection pooling](/glossary/connection-pooling/) prevents database connection exhaustion
4. **Memory monitoring**: [Telemetry](/glossary/telemetry/)-based alerts when memory consumption approaches limits

## Deployment Infrastructure

### Production Deployment

The DD platform deploys as part of the Prismatic umbrella on [Fly.io](/glossary/fly-io/):

| Component | Infrastructure | Configuration |
|-----------|---------------|---------------|
| **Elixir application** | Fly.io machine | 2 vCPU, 4GB RAM, auto-scaling |
| **PostgreSQL** | Fly.io Postgres | 2 vCPU, 4GB RAM, automated backups |
| **Meilisearch** | Fly.io machine | 1 vCPU, 2GB RAM, persistent volume |
| **KuzuDB** | Embedded (in-process) | Shared application memory |

### Performance Characteristics

| Metric | Target | Measured |
|--------|--------|---------|
| **Page load time** | < 250ms | 120-180ms |
| **LiveView mount** | < 150ms | 80-120ms |
| **Entity search** | < 50ms | 15-35ms |
| **Graph traversal (5 hops)** | < 100ms | 30-70ms |
| **Risk score computation** | < 500ms per entity | 200-400ms |
| **Full enrichment (50 entities)** | < 30 minutes | 10-25 minutes |
| **Report generation** | < 60 seconds | 15-45 seconds |

### Observability

The platform provides comprehensive [observability](/glossary/observability/) through:

- **[Telemetry](/glossary/telemetry/)**: Structured metrics for every subsystem (collection latency, validation throughput, risk computation time)
- **[Structured logging](/glossary/structured-logging/)**: JSON-formatted logs with investigation context (case ID, entity ID, source)
- **Health endpoints**: `/health` and `/readiness` for infrastructure monitoring
- **LiveView dashboards**: Real-time operational dashboards for platform operators

## Security Architecture

### Data Protection

| Layer | Protection |
|-------|-----------|
| **Transport** | TLS 1.3 for all external communications |
| **Storage** | [Encryption at rest](/glossary/encryption-at-rest/) for PostgreSQL and Meilisearch |
| **Application** | [RBAC](/glossary/rbac/) for case-level access control |
| **API credentials** | Encrypted credential storage, per-source rotation |
| **Audit** | Immutable [audit trail](/glossary/audit-trail/) for all operations |

### Multi-Tenancy Isolation

Investigation data is isolated at the case level through:
- PostgreSQL row-level security policies
- Case-scoped Meilisearch indexes
- Case-filtered KuzuDB graph queries
- Case-scoped PubSub topics

## Quality Assurance

The DD platform follows the platform's [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) quality doctrine:

- **Zero compilation warnings**: `mix compile --warnings-as-errors` across all DD modules
- **Comprehensive test coverage**: Unit tests, integration tests, and property-based tests for all adapters
- **[Dialyzer](/glossary/dialyzer/) type checking**: Full type specification coverage
- **[Credo](/glossary/credo/) compliance**: All static analysis checks passing
- **[Quality gates](/capabilities/quality-gates/)**: Automated quality gates block non-compliant code

## Conclusion

The Elixir/OTP architecture provides the ideal foundation for a due diligence platform that must handle massive concurrent data collection, maintain fault tolerance across hundreds of external source integrations, and deliver real-time investigation updates through an interactive web interface. The polyglot persistence strategy ensures that each data access pattern is served by the most appropriate storage engine, while OTP supervision trees provide the fault isolation necessary for reliable production operation.

## References

- [Elixir Programming Language](/glossary/elixir/)
- [OTP Framework](/glossary/otp/)
- [BEAM Virtual Machine](/glossary/beam/)
- [Phoenix LiveView](/glossary/liveview/)
- [PostgreSQL](/glossary/postgresql/)
- [KuzuDB](/glossary/kuzudb/)
- [Meilisearch](/glossary/meilisearch/)
- [Supervision Trees](/glossary/supervision-tree/)
- [Broadway Pipeline](/glossary/broadway/)
- [Platform Architecture](/architecture/)
- [Umbrella Applications](/glossary/umbrella/)

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
