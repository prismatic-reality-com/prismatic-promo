+++
title = "etl-pipeline-specialist"
weight = 154
[extra]
domain = "integration"
level = "L3"
description = "Extract-transform-load workflow design and orchestration with GenStage backpressure and multi-source data ingestion"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "genstage", "telemetry", "mycelial-network"]
domain_normalized = "general"
content_version = "3.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["etl-pipeline-specialist", "Extract-transform-load", "GenStage", "agents", "agent", "Prismatic Platform", "The ETL", "Data", "Pipeline"]
tags = ["agents", "agent", "etl-pipeline-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "etl-pipeline-specialist - Prismatic Platform"
+++

## Overview

The [ETL](/glossary/etl/) Pipeline Specialist is an L3 strategic authority operating within the Integration domain of the Prismatic Platform. This agent designs, implements, and orchestrates Extract-Transform-Load workflows that move data between external sources, internal data stores, and processing pipelines. Leveraging [Elixir](/glossary/elixir/)'s [GenStage](/glossary/genstage/) framework for [backpressure](/glossary/backpressure/)-aware [stream processing](/glossary/stream-processing/), the ETL Specialist builds [data pipeline](/glossary/data-pipeline/)s that are both performant and resilient, handling variable data volumes without overwhelming downstream consumers.

The platform's intelligence and compliance capabilities depend on continuous data ingestion from diverse sources: Czech public registries, [OSINT](/glossary/osint/) providers, security scanning results, and visitor analytics streams. Each source has unique data formats, access patterns, rate limits, and reliability characteristics. The ETL Pipeline Specialist abstracts these differences behind uniform pipeline interfaces, implementing source-specific adapters that normalize data into platform-standard formats while preserving complete provenance metadata for every extracted record.

Data pipeline reliability is not optional in a platform where intelligence findings and compliance assessments depend on complete, timely data ingestion. A dropped record from a Czech registry query could mean a missing insolvency finding in an employee screening report. A corrupted transformation could produce false compliance assessments. The ETL Specialist enforces zero-data-loss guarantees through at-least-once delivery semantics, dead letter queues for failed records, and end-to-end provenance tracking that enables full audit trail reconstruction.

## Operational Domain

The agent operates in the data integration layer, bridging external data sources with internal storage and processing systems. It manages GenStage producer-consumer topologies that implement backpressure to prevent memory exhaustion during high-volume ingestion. The specialist also handles error recovery in data pipelines, implementing retry strategies with exponential backoff, dead letter queues for failed records, and alerting for persistent pipeline failures.

The Integration domain requires coordination with both external systems (which define data availability and access patterns) and internal consumers (which define data format and delivery requirements). The ETL Specialist serves as the translation layer between these two worlds, ensuring that data flows reliably from source to destination regardless of the specific characteristics of either endpoint.

## Key Capabilities

The ETL Pipeline Specialist provides six core capabilities for data pipeline design and operation.

**GenStage pipeline design** builds backpressure-aware producer-consumer topologies that automatically throttle extraction when transformation or loading stages fall behind. The specialist designs pipelines as chains of GenStage producers, producer-consumers, and consumers, where demand flows upstream from consumers to producers. This demand-driven architecture ensures that producers never generate more data than the pipeline can process, preventing memory exhaustion and maintaining consistent throughput regardless of data volume.

**Source adapter management** implements and maintains source-specific extraction adapters that handle authentication, pagination, [rate limiting](/glossary/rate-limiting/), and data format normalization. Each adapter encapsulates the complexity of its source system -- HTTP API pagination, SOAP service authentication, file format parsing, or database query optimization -- behind a uniform extraction interface. The specialist maintains adapter configurations including rate limit parameters, retry policies, and source-specific error handling rules.

**Data transformation pipelines** apply business rules, schema mapping, deduplication, and enrichment to extracted data before loading into target stores. Transformations are implemented as pure functions that receive a record and return a transformed record, enabling straightforward testing and composition. Complex transformations are decomposed into stages, each implemented as a GenStage producer-consumer, allowing independent scaling of transformation throughput.

**Pipeline resilience** implements retry strategies, [circuit breaker](/glossary/circuit-breaker/)s, and dead letter queues that handle transient failures without losing data or corrupting pipeline state. Transient failures (network timeouts, temporary rate limiting, intermittent service unavailability) are retried with exponential backoff. Persistent failures (malformed records, schema violations, authorization failures) are routed to dead letter queues for manual investigation. Circuit breakers prevent failed sources from consuming pipeline capacity through repeated failed requests.

**Incremental extraction** tracks extraction watermarks and change detection to minimize redundant data transfer and reduce load on source systems. The specialist maintains watermark state (last extracted timestamp, last extracted ID, or source-provided change tokens) for each pipeline, enabling subsequent extraction runs to retrieve only new or modified records. Incremental extraction reduces source system load, network bandwidth consumption, and transformation processing time.

**Pipeline monitoring and alerting** tracks extraction rates, transformation throughput, load success rates, and end-to-end pipeline latency with configurable alert thresholds. Monitoring data is emitted through platform [telemetry](/glossary/telemetry/) under the `[:prismatic_etl, :pipeline, *]` namespace, providing real-time visibility into pipeline health. Alert thresholds detect extraction rate drops (source unavailability), transformation error spikes (schema changes), and loading failures (target system issues).

## Pipeline Architecture

ETL pipelines follow a standard GenStage topology with configurable stages.

```
Source Adapter --> Extraction Producer --> Transform Stage(s) --> Load Consumer
      |                  |                      |                     |
  Authentication     Backpressure           Pure functions       Target store
  Pagination         demand-driven          Schema mapping       Batch writes
  Rate limiting      Watermark tracking     Deduplication        Provenance
  Error handling     Record emission        Enrichment           recording

  Dead Letter Queue <-- Error Handler <-- Validation Stage
        |                    |                  |
    Failed records       Retry logic        Schema check
    Manual review        Circuit breaker     Data quality
    Alerting             Backoff strategy    Completeness
```

## Pipeline Performance Metrics

The specialist tracks pipeline performance through quantitative metrics.

| Metric | Target | Description |
|--------|--------|-------------|
| Extraction throughput | Source-dependent | Records extracted per second |
| Transformation latency | < 100ms/record | Per-record transformation time |
| End-to-end latency | < 5 minutes | Time from extraction to availability |
| Dead letter rate | < 0.1% | Percentage of records failing permanently |
| Watermark currency | < 15 minutes | Time since last successful extraction |
| Pipeline availability | > 99.5% | Uptime of configured pipelines |

## Source Adapter Catalog

The platform maintains adapters for diverse data sources.

| Source Category | Examples | Extraction Pattern |
|----------------|---------|-------------------|
| Czech registries | ARES, Justice.cz, ISIR | HTTP API with pagination |
| OSINT providers | Social media, domain data | API with rate limiting |
| Security scanners | Port scans, vulnerability data | Batch file processing |
| Analytics streams | Visitor data, telemetry | Real-time streaming |
| Database sources | PostgreSQL, external databases | Change data capture |

## Data Quality Enforcement

Every record passing through the pipeline undergoes quality validation.

| Check | Stage | Action on Failure |
|-------|-------|-------------------|
| Schema validation | Post-extraction | Dead letter queue |
| Completeness check | Post-extraction | Retry or dead letter |
| Deduplication | Pre-transformation | Record suppression |
| Business rule validation | Post-transformation | Dead letter with context |
| Provenance verification | Pre-loading | Block load until provenance complete |

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - Multi-domain coordination with authority to design pipeline architectures, mandate data format standards, and coordinate data flow across domain boundaries.

## Coordination

| Agent | Relationship | Domain |
|-------|-------------|--------|
| [adapter-pattern-specialist](/agents/adapter-pattern-specialist/) | Coordinates on source adapter design patterns and interface standards | Integration |
| [data-sync-specialist](/agents/data-sync-specialist/) | Collaborates on cross-system data consistency for bidirectional sync scenarios | Integration |
| [data-integrity-specialist](/agents/data-integrity-specialist/) | Validates data integrity at pipeline boundaries between extraction and loading stages | Infrastructure |

## Enforcement

The ETL Pipeline Specialist operates under the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. No data pipeline operates without monitoring, alerting, and dead letter queue configuration. Every extracted record must carry source provenance metadata. Pipeline failures must be detected and reported within configurable SLA windows. Data that fails transformation validation is quarantined, never silently dropped or loaded in corrupt form. Zero-data-loss guarantees are enforced through at-least-once delivery semantics and comprehensive dead letter queue management.

## Related Agents

- [**adapter-pattern-specialist**](/agents/adapter-pattern-specialist/) (L3) - Source adapter design patterns and interface standards
- [**data-sync-specialist**](/agents/data-sync-specialist/) (L3) - Cross-system data consistency and bidirectional synchronization
- [**data-integrity-specialist**](/agents/data-integrity-specialist/) (L3) - Data integrity validation and enforcement

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)