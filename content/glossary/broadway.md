+++
title = "Broadway"
weight = 15
[extra]
category = "architecture"
description = "Concurrent, multi-stage data ingestion and processing framework built on GenStage for building robust data pipelines."
related_terms = ["genstage", "backpressure", "otp"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1284
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Broadway", "Concurrent", "GenStage", "glossary", "architecture", "Prismatic Platform", "Manual", "Built", "Producer"]
tags = ["glossary", "architecture", "broadway", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Broadway - Prismatic Platform"
+++

## Definition

Broadway is an Elixir library for building concurrent, multi-stage data ingestion and processing pipelines with built-in fault tolerance, automatic batching, graceful shutdown, and demand-driven [backpressure](@/glossary/backpressure.md). Created by the team at Dashbit (including Jose Valim, the creator of Elixir), Broadway abstracts the complexity of concurrent data processing into a declarative pipeline definition, allowing developers to focus on business logic while the framework handles concurrency management, failure recovery, and throughput optimization.

Broadway builds on top of [GenStage](@/glossary/genstage.md), the lower-level producer-consumer library, but provides a significantly higher-level API. Where GenStage requires manual management of demand, dispatcher configuration, and subscription setup, Broadway encapsulates these concerns into a single `use Broadway` declaration with a configuration DSL. The result is that teams can build production-grade data pipelines -- complete with batching, rate limiting, and dead-letter queues -- in under 100 lines of code.

The library follows a three-stage architecture: producers emit messages from external sources (message queues, databases, APIs), processors transform messages individually with configurable concurrency, and batchers group processed messages for efficient bulk output operations. Each stage runs as a supervised [BEAM](@/glossary/beam.md) process, meaning individual failures are isolated and automatically recovered without affecting the rest of the pipeline.

## Overview

Broadway pipelines are defined declaratively and consist of three cooperating stages:

```
External Source (SQS, Kafka, RabbitMQ, custom)
        |
        v
  +-----------+
  | Producers  |  Fetch messages from external sources
  +-----------+
        |
        v  (demand-driven backpressure)
  +-----------+
  | Processors |  Transform messages (configurable concurrency)
  +-----------+
        |
        v  (partitioned by batcher key)
  +-----------+
  | Batchers   |  Group messages for bulk operations
  +-----------+
        |
        v
  +-----------+
  | Batch      |  Execute bulk operations (DB insert, API call, file write)
  | Handlers   |
  +-----------+
        |
        v
  Acknowledgment (success/failure reported to producer)
```

### Stage Responsibilities

| Stage | Process Count | Responsibility |
|-------|--------------|---------------|
| **Producer** | 1+ (configurable) | Fetches messages from external sources, manages acknowledgments |
| **Processor** | N (configurable concurrency) | Per-message transformation, validation, enrichment |
| **Batcher** | 1 per batcher key | Collects processed messages into size/time-bounded batches |
| **Batch Handler** | N (configurable concurrency) | Executes bulk operations on collected batches |

Broadway's acknowledgment system provides exactly-once processing semantics (or at-least-once, depending on the producer configuration). When a message is successfully processed and batched, Broadway acknowledges it to the producer; when a message fails, it can be retried, dead-lettered, or reported. Broadway also implements graceful shutdown by default, ensuring that in-flight messages are fully processed before the pipeline terminates, which is critical for data integrity during deployments.

## Technical Details

### Backpressure and Flow Control

Broadway inherits GenStage's demand-driven [backpressure](@/glossary/backpressure.md) model, ensuring that no stage in the pipeline can overwhelm downstream stages. The flow control works as follows:

| Mechanism | Behavior |
|-----------|----------|
| **Demand propagation** | Processors request messages from producers only when they have capacity |
| **min_demand / max_demand** | Configure how many messages processors request at a time |
| **batch_size** | Maximum messages accumulated before triggering a batch handler |
| **batch_timeout** | Maximum time to wait before flushing an incomplete batch |
| **Producer rate limiting** | Producers can enforce global rate limits across all processor instances |

```elixir
# Rate limiting: limit the entire pipeline to 1000 messages per second
producer: [
  module: {MyProducer, []},
  rate_limiting: [
    allowed_messages: 1000,
    interval: 1_000  # milliseconds
  ]
]
```

This backpressure model prevents the common failure mode in naive pipeline architectures where a fast producer overwhelms slow consumers, leading to unbounded memory growth and eventual system crash.

### Acknowledgment and Failure Handling

```elixir
@impl true
def handle_failed(messages, _context) do
  # Called for all messages that failed during processing
  Enum.each(messages, fn message ->
    Logger.error("Failed to process message: #{inspect(message.data)}, reason: #{inspect(message.status)}")
    PrismaticPerimeter.DeadLetter.store(message.data, message.status)
  end)

  messages
end
```

| Failure Scenario | Broadway Response |
|-----------------|-------------------|
| **Processor exception** | Message marked as failed, `handle_failed/2` called |
| **Batch handler exception** | All messages in batch marked as failed |
| **Producer crash** | Supervisor restarts producer, processing resumes |
| **Processor crash** | Supervisor restarts processor, in-flight message re-dispatched |
| **Graceful shutdown** | All in-flight messages processed before termination |

### Available Producers

Broadway supports multiple message sources through its producer ecosystem:

| Producer | Source | Package |
|----------|--------|---------|
| **BroadwaySQS** | Amazon SQS | `broadway_sqs` |
| **BroadwayKafka** | Apache Kafka | `broadway_kafka` |
| **BroadwayRabbitMQ** | RabbitMQ | `broadway_rabbitmq` |
| **BroadwayRedis** | Redis Streams | `off_broadway_redis` |
| **Custom** | Any data source | Implement `Broadway.Producer` behaviour |

### Telemetry and Monitoring

Broadway emits telemetry events at every stage of pipeline processing, enabling comprehensive [observability](@/glossary/observability.md):

| Event | Measurements | Use Case |
|-------|-------------|----------|
| `[:broadway, :processor, :start]` | `system_time` | Track processing start |
| `[:broadway, :processor, :stop]` | `duration` | Measure per-message processing time |
| `[:broadway, :batcher, :start]` | `system_time` | Track batch formation |
| `[:broadway, :batch_processor, :stop]` | `duration` | Measure batch processing time |
| `[:broadway, :processor, :message, :exception]` | `duration` | Track processing failures |

## Implementation in Prismatic Platform

A complete Broadway pipeline in the Prismatic Platform is defined in a single module:

```elixir
defmodule PrismaticPerimeter.Pipeline.AssetDiscovery do
  use Broadway

  alias Broadway.Message

  @impl true
  def start_link(opts) do
    Broadway.start_link(__MODULE__,
      name: __MODULE__,
      producer: [
        module: {PrismaticPerimeter.Producer.ScanQueue, []},
        concurrency: 2,
        transformer: {__MODULE__, :transform, []}
      ],
      processors: [
        default: [
          concurrency: 10,
          min_demand: 5,
          max_demand: 20
        ]
      ],
      batchers: [
        assets: [
          concurrency: 3,
          batch_size: 50,
          batch_timeout: 5_000
        ],
        vulnerabilities: [
          concurrency: 2,
          batch_size: 25,
          batch_timeout: 10_000
        ]
      ]
    )
  end

  @impl true
  def handle_message(:default, %Message{data: scan_result} = message, _context) do
    case PrismaticPerimeter.Enricher.enrich(scan_result) do
      {:ok, enriched} ->
        message
        |> Message.update_data(fn _ -> enriched end)
        |> Message.put_batcher(determine_batcher(enriched))

      {:error, reason} ->
        Message.failed(message, reason)
    end
  end

  @impl true
  def handle_batch(:assets, messages, _batch_info, _context) do
    assets = Enum.map(messages, & &1.data)
    PrismaticPerimeter.Storage.bulk_upsert_assets(assets)
    messages
  end

  @impl true
  def handle_batch(:vulnerabilities, messages, _batch_info, _context) do
    vulns = Enum.map(messages, & &1.data)
    PrismaticPerimeter.Storage.bulk_insert_vulnerabilities(vulns)
    Phoenix.PubSub.broadcast(Prismatic.PubSub, "perimeter:updates", {:vulnerabilities_found, length(vulns)})
    messages
  end

  defp determine_batcher(%{type: :vulnerability}), do: :vulnerabilities
  defp determine_batcher(_), do: :assets
end
```

The platform uses Broadway for high-throughput data processing across multiple domains:

| Pipeline | Producer Source | Processors | Batchers | Use Case |
|----------|----------------|------------|----------|----------|
| **Asset Discovery** | Scan queue | 10 concurrent | assets, vulnerabilities | Perimeter EASM asset processing |
| **OSINT Feed Ingestion** | External OSINT feeds | 8 concurrent | intelligence, alerts | Security intelligence aggregation |
| **Security Event Processing** | Event stream | 5 concurrent | events, notifications | Real-time security monitoring |
| **Agent Telemetry** | Agent message bus | 4 concurrent | metrics, logs | Agent performance tracking |

Broadway's backpressure mechanisms integrate naturally with the platform's [GenStage](@/glossary/genstage.md) infrastructure and [OTP](@/glossary/otp.md) supervision patterns. Each Broadway pipeline runs under its own supervisor, isolated from other platform components. The Prismatic Platform uses custom producers for its OSINT feed ingestion, security scan queue processing, and asset discovery pipelines, implementing the `Broadway.Producer` [behaviour](@/glossary/behaviour.md) to integrate with platform-specific data sources.

## Comparison with Alternatives

| Feature | Broadway | GenStage | Apache Kafka Streams | RabbitMQ Consumers | AWS Lambda |
|---------|----------|----------|---------------------|-------------------|-----------|
| **Language** | Elixir | Elixir | Java/Scala | Language-agnostic | Language-agnostic |
| **Backpressure** | Built-in (demand-driven) | Built-in | Built-in (consumer lag) | Manual (prefetch count) | None (event-driven) |
| **Batching** | Built-in | Manual | Built-in (windowing) | Manual | Event source batching |
| **Acknowledgment** | Built-in | Manual | Offset commit | Manual ack/nack | Automatic |
| **Fault Tolerance** | OTP supervision | OTP supervision | Kafka rebalancing | Channel recovery | AWS retry |
| **Graceful Shutdown** | Automatic | Manual | Consumer group protocol | Manual | N/A |
| **Rate Limiting** | Built-in | Manual | Consumer lag-based | Prefetch count | Concurrency limit |
| **Deployment** | Single BEAM node or cluster | Single BEAM node or cluster | Dedicated Kafka cluster | Dedicated RabbitMQ cluster | AWS infrastructure |
| **Complexity** | Low (declarative) | Medium (manual wiring) | High (cluster ops) | Medium | Low |

Broadway distinguishes itself through its declarative configuration, automatic fault recovery via OTP supervision, and native integration with the BEAM's lightweight process model. While Kafka Streams offers superior horizontal scaling for very high-volume workloads (millions of messages per second), Broadway provides significantly simpler operational overhead and integrates naturally with the rest of the Elixir/OTP ecosystem.

## Best Practices

**Pipeline Design**: Structure pipelines with a clear separation between message transformation (processors) and side-effecting operations (batch handlers). Processors should be pure functions where possible, validating and enriching messages without external I/O. Batch handlers should perform bulk operations (database inserts, API calls) to amortize I/O overhead across many messages.

**Concurrency Tuning**: Set processor concurrency based on the nature of the work. CPU-bound transformations benefit from concurrency matching the number of schedulers (`System.schedulers_online()`). I/O-bound operations (external API calls) benefit from higher concurrency (2-4x schedulers) to overlap waiting time.

**Batch Configuration**: Choose batch sizes based on the downstream system's optimal bulk operation size. Database bulk inserts are typically most efficient at 50-500 rows. API calls with payload limits may require smaller batches. Set `batch_timeout` to ensure batches are flushed even during low-traffic periods.

**Error Handling**: Implement `handle_failed/2` to capture failed messages for dead-letter processing. Distinguish between transient failures (network timeouts, temporary unavailability) that should be retried and permanent failures (invalid data, missing required fields) that should be dead-lettered immediately.

**Monitoring**: Attach telemetry handlers to all Broadway events to track per-stage processing latency, throughput, and failure rates. Use these metrics to identify bottleneck stages and tune concurrency accordingly.

## Use Cases

Broadway is best suited for scenarios that involve continuous data ingestion from external sources with variable throughput, where individual message processing is computationally lightweight but bulk output operations benefit from batching. Common patterns include:

- **Message Queue Processing**: Consuming messages from SQS, Kafka, or RabbitMQ with automatic backpressure and acknowledgment management
- **OSINT Feed Ingestion**: Processing real-time intelligence feeds from multiple providers with enrichment, deduplication, and bulk storage
- **Security Event Processing**: Ingesting and correlating security events from multiple scanners with real-time alerting via PubSub broadcasting
- **Asset Discovery Pipelines**: Processing discovered assets through validation, enrichment, and storage with separate handling paths for different asset types
- **Telemetry Aggregation**: Collecting agent execution metrics and telemetry events for bulk persistence to TimescaleDB
- **ETL Workflows**: Extracting data from external APIs, transforming it through enrichment stages, and loading it into the platform's multi-store architecture

## Related Concepts

- [GenStage](@/glossary/genstage.md) - Foundation library Broadway builds upon
- [Backpressure](@/glossary/backpressure.md) - Flow control mechanism preventing pipeline overload
- [OTP](@/glossary/otp.md) - Framework providing supervision for Broadway processes
- [BEAM](@/glossary/beam.md) - Virtual machine running Broadway's concurrent processes
- [Supervisor](@/glossary/supervisor.md) - Manages Broadway pipeline lifecycle and fault recovery
- [Data Pipeline](@/glossary/data-pipeline.md) - General pattern Broadway implements
- [Stream Processing](@/glossary/stream-processing.md) - Real-time data processing paradigm
- [Behaviour](@/glossary/behaviour.md) - Interface pattern used by Broadway producers
- [PubSub](@/glossary/pubsub.md) - Event broadcasting from batch handlers
- [Observability](@/glossary/observability.md) - Telemetry-based pipeline monitoring
- [EASM](@/glossary/easm.md) - Attack surface management using Broadway pipelines

## See Also

- [Architecture](@/architecture/_index.md) - Platform architecture
- [Technologies](@/technologies/_index.md) - Technology stack
- [Fault Tolerance](@/glossary/fault-tolerance.md) - Reliability through supervision and acknowledgment
- [Rate Limiting](@/glossary/rate-limiting.md) - Throughput control in Broadway pipelines

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)