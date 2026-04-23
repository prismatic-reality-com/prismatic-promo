+++
title = "Data Pipeline"
weight = 34
[extra]
category = "architecture"
description = "Automated sequence of data processing stages moving data from sources to destinations"
related_terms = ["stream-processing", "broadway", "etl", "pipe-operator", "genstage", "backpressure", "data-pipeline", "observability"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1057
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Data", "Pipeline", "Automated", "glossary", "architecture", "Prismatic Platform", "Broadway", "GenStage"]
tags = ["glossary", "architecture", "data-pipeline", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Data Pipeline - Prismatic Platform"
+++

## Definition

A data pipeline is an automated system that moves and transforms data through a series of processing stages from source to destination. Each stage performs a specific operation -- extraction, validation, transformation, enrichment, aggregation, or loading -- and passes its output to the next stage. Pipelines encode the entire data flow as a directed acyclic graph (DAG) of processing steps, making the flow explicit, observable, and reproducible. Well-designed pipelines are composable (stages can be rearranged and reused), observable (each stage emits metrics and logs), idempotent (re-running produces the same result), and resilient (individual stage failures are contained and recovered).

Data pipelines exist at the intersection of data engineering and software architecture. They are distinct from simple scripts or ad-hoc data processing in their emphasis on reliability, observability, and operational maturity. A production data pipeline handles schema evolution, late-arriving data, partial failures, backpressure, exactly-once semantics, and monitoring -- concerns that rarely arise in one-off data processing but are essential when data flows continuously and downstream consumers depend on its availability and correctness.

The Prismatic Platform's architecture is fundamentally pipeline-oriented. Intelligence data flows from external sources through extraction, normalization, enrichment, verification, and indexing stages before becoming available to consumers via dashboards, APIs, and agent queries. The platform's adoption of [Broadway](@/glossary/broadway.md) and [GenStage](@/glossary/genstage.md) means that pipelines are not merely conceptual but are explicit OTP processes connected by demand-driven data flow with built-in [backpressure](@/glossary/backpressure.md) and fault tolerance.

## Pipeline Topology

Data pipelines can be organized in several topologies, each suited to different processing requirements.

### Linear Pipeline

The simplest topology: data flows through a fixed sequence of stages.

```
Source → Stage A → Stage B → Stage C → Destination
```

Use case: Simple ETL where data is extracted, transformed, and loaded in sequence.

### Fan-Out Pipeline

A single source feeds multiple parallel processing paths.

```
              ┌→ Path 1 → Dest A
Source → Split┤
              ├→ Path 2 → Dest B
              └→ Path 3 → Dest C
```

Use case: Prismatic's multi-destination loading (PostgreSQL, Meilisearch, KuzuDB simultaneously).

### Fan-In Pipeline

Multiple sources converge into a single processing path.

```
Source A →┐
Source B →├→ Merge → Process → Destination
Source C →┘
```

Use case: Intelligence fusion combining data from [Shodan](@/glossary/shodan.md), [Censys](@/glossary/censys.md), and [GreyNoise](@/glossary/greynoise.md).

### DAG Pipeline

The most general form: a directed acyclic graph where stages can have multiple inputs and outputs.

```
Source A → Extract A ──┐
                       ├→ Entity Resolution → Scoring → PostgreSQL
Source B → Extract B ──┤                        ↓
                       │                    Meilisearch
Source C → Extract C ──┘                        ↓
                                            KuzuDB
```

Use case: Prismatic's OSINT intelligence pipeline with cross-source entity resolution and multi-destination output.

## Pipeline Architecture Patterns

### Batch Pipeline

Processes accumulated data at scheduled intervals. All data is available before processing begins.

| Characteristic | Value |
|---------------|-------|
| **Trigger** | Schedule (cron), file arrival, manual |
| **Latency** | Minutes to hours |
| **Data model** | Bounded dataset |
| **State** | Recomputed each run |
| **Failure recovery** | Reprocess entire batch |
| **Best for** | Bulk analysis, historical processing, reporting |

### Streaming Pipeline

Processes data continuously as it arrives. Data is unbounded and potentially infinite.

| Characteristic | Value |
|---------------|-------|
| **Trigger** | Event arrival (continuous) |
| **Latency** | Milliseconds to seconds |
| **Data model** | Unbounded stream |
| **State** | Maintained incrementally |
| **Failure recovery** | Checkpoint and resume |
| **Best for** | Real-time monitoring, alerting, live dashboards |

### Micro-Batch Pipeline

A hybrid approach that accumulates small batches and processes them frequently, combining batch simplicity with near-real-time latency.

| Characteristic | Value |
|---------------|-------|
| **Trigger** | Time interval (seconds) or batch size threshold |
| **Latency** | Seconds to minutes |
| **Data model** | Small bounded batches from unbounded stream |
| **State** | Batch-local with periodic checkpointing |
| **Failure recovery** | Reprocess individual micro-batch |
| **Best for** | Broadway batchers, aggregation-heavy workloads |

## Prismatic's OSINT Pipeline

The Prismatic Platform's primary data pipeline implements the intelligence lifecycle from raw OSINT data to actionable security assessments.

### Pipeline Stages

```
┌──────────┐   ┌───────────┐   ┌──────────┐   ┌──────────┐   ┌─────────┐
│  Crawl   │──►│  Extract  │──►│  Verify  │──►│  Store   │──►│  Index  │
│          │   │           │   │          │   │          │   │         │
│ Discover │   │ Parse     │   │ Validate │   │ Persist  │   │ Search  │
│ Schedule │   │ Normalize │   │ Score    │   │ Upsert   │   │ Graph   │
│ Paginate │   │ Enrich    │   │ Dedupe   │   │ Replicate│   │ Cache   │
└──────────┘   └───────────┘   └──────────┘   └──────────┘   └─────────┘
```

| Stage | Description | Key Operations | Output |
|-------|-------------|----------------|--------|
| **Crawl** | Discover and fetch raw data from sources | Domain enumeration, API pagination, rate limiting | Raw API responses |
| **Extract** | Parse and normalize raw data into canonical format | Schema mapping, field extraction, format conversion | Normalized records |
| **Verify** | Validate data quality and compute confidence scores | Schema validation, deduplication, confidence scoring | Verified records |
| **Store** | Persist verified data to destination backends | Upsert to PostgreSQL, write-through to ETS | Persistent records |
| **Index** | Build searchable indexes and graph relationships | Meilisearch indexing, KuzuDB edge creation | Indexed, queryable data |

### Stage Implementation

Each pipeline stage is implemented as a Broadway processor or batcher, connected by GenStage demand-driven flow.

```elixir
defmodule PrismaticOsint.Pipeline.IntelligencePipeline do
  use Broadway

  def start_link(opts) do
    Broadway.start_link(__MODULE__,
      name: pipeline_name(opts),
      producer: [
        module: {PrismaticOsint.Producer.CrawlProducer, opts},
        concurrency: opts[:crawl_concurrency] || 2
      ],
      processors: [
        extract: [concurrency: opts[:extract_concurrency] || 4],
        verify: [concurrency: opts[:verify_concurrency] || 8]
      ],
      batchers: [
        store: [batch_size: 100, batch_timeout: 5_000, concurrency: 2],
        index: [batch_size: 50, batch_timeout: 10_000, concurrency: 2]
      ]
    )
  end

  @impl true
  def handle_message(:extract, message, _context) do
    with {:ok, normalized} <- PrismaticOsint.Extractor.normalize(message.data),
         {:ok, enriched} <- PrismaticOsint.Enricher.enrich(normalized) do
      Message.update_data(message, fn _ -> enriched end)
    else
      {:error, reason} -> Message.failed(message, reason)
    end
  end

  @impl true
  def handle_message(:verify, message, _context) do
    verified = PrismaticOsint.Verifier.verify(message.data)

    message
    |> Message.update_data(fn _ -> verified end)
    |> Message.put_batcher(:store)
  end

  @impl true
  def handle_batch(:store, messages, _info, _context) do
    records = Enum.map(messages, & &1.data)
    {:ok, _count} = PrismaticStorage.Ecto.bulk_upsert(records)

    # Fan out to indexing
    Enum.each(records, &PrismaticOsint.IndexQueue.enqueue/1)

    messages
  end
end
```

## DAG-Based Orchestration

Complex pipelines with dependencies between stages require DAG-based orchestration to ensure correct execution order and efficient parallelism.

### Dependency Resolution

```elixir
defmodule PrismaticOsint.Pipeline.Orchestrator do
  @pipeline_dag %{
    crawl_shodan: [],
    crawl_censys: [],
    crawl_greynoise: [],
    extract_shodan: [:crawl_shodan],
    extract_censys: [:crawl_censys],
    extract_greynoise: [:crawl_greynoise],
    entity_resolution: [:extract_shodan, :extract_censys, :extract_greynoise],
    scoring: [:entity_resolution],
    load_postgresql: [:scoring],
    load_meilisearch: [:scoring],
    load_kuzudb: [:entity_resolution]
  }

  def execute_pipeline do
    @pipeline_dag
    |> topological_sort()
    |> execute_levels()
  end

  defp execute_levels(levels) do
    Enum.each(levels, fn level ->
      # Execute all stages in the same level concurrently
      level
      |> Enum.map(&Task.async(fn -> execute_stage(&1) end))
      |> Task.await_many(:timer.minutes(5))
    end)
  end
end
```

### Execution Timeline

```
Time →
Level 0: [crawl_shodan]  [crawl_censys]  [crawl_greynoise]    (parallel)
Level 1: [extract_shodan] [extract_censys] [extract_greynoise] (parallel)
Level 2: [entity_resolution]                                    (depends on all extracts)
Level 3: [scoring]                                              (depends on entity_resolution)
Level 4: [load_postgresql] [load_meilisearch] [load_kuzudb]    (parallel, scoring done)
```

## Pipeline Monitoring and Observability

Production data pipelines require comprehensive [observability](@/glossary/observability.md) to detect degradation, diagnose failures, and optimize throughput.

### Key Metrics

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| **Throughput** | Records processed per second | < 50% of baseline |
| **End-to-end latency** | Time from source ingestion to destination availability | > 5 minutes |
| **Stage latency** | Processing time per stage | > 2x normal for any stage |
| **Error rate** | Percentage of records failing processing | > 5% |
| **Backpressure ratio** | Demand vs supply at each stage boundary | < 0.5 (consumer starving) |
| **Queue depth** | Records buffered between stages | > 10,000 |
| **Dead letter count** | Records that failed all retry attempts | > 0 (investigate) |
| **Data freshness** | Age of newest record in destination | > 2x pipeline interval |

### Telemetry Integration

Broadway emits Telemetry events at each pipeline stage, which the Prismatic Platform collects for monitoring.

```elixir
# Pipeline telemetry handler
:telemetry.attach_many(
  "pipeline-monitor",
  [
    [:broadway, :processor, :message, :stop],
    [:broadway, :batcher, :stop],
    [:broadway, :processor, :message, :exception]
  ],
  &PrismaticOsint.PipelineMonitor.handle_event/4,
  nil
)
```

## Pipeline Resilience Patterns

| Pattern | Description | Implementation |
|---------|-------------|----------------|
| **Retry with backoff** | Retry failed operations with increasing delay | Broadway message retry + exponential backoff |
| **Dead letter queue** | Route permanently failed records for investigation | Separate Broadway batcher for failures |
| **Circuit breaker** | Stop calling failing external services | [Circuit Breaker](@/glossary/circuit-breaker.md) per provider |
| **Checkpointing** | Record processing progress for resumption | Broadway acknowledgment + offset tracking |
| **Idempotent operations** | Ensure re-processing produces same result | Upsert with conflict resolution |
| **Stage isolation** | Contain failures to single stage | OTP supervision, independent stage restarts |
| **Graceful degradation** | Continue with reduced functionality | Skip enrichment if enricher unavailable |

## Comparison with Elixir's Pipe Operator

The [pipe operator](@/glossary/pipe-operator.md) (`|>`) in Elixir and the data pipeline pattern share a conceptual similarity -- both chain transformations -- but operate at fundamentally different scales.

| Dimension | Pipe Operator (`\|>`) | Data Pipeline |
|-----------|----------------------|---------------|
| **Scope** | Single function chain | Distributed system |
| **Concurrency** | Sequential (single process) | Multi-process, multi-node |
| **Failure handling** | Exceptions, pattern matching | Retry, DLQ, circuit breaker |
| **Observability** | Debugger, IO.inspect | Telemetry, metrics, dashboards |
| **Backpressure** | N/A (synchronous) | GenStage demand-driven |
| **State** | Function arguments | Process state, ETS, databases |

However, the pipe operator's functional composition philosophy directly influences how individual pipeline stages are implemented: each stage is a pure transformation function that can be tested and reasoned about independently.

## Related Terms

- [Stream Processing](@/glossary/stream-processing.md) - Real-time variant of data pipeline processing
- [Broadway](@/glossary/broadway.md) - Elixir library for building concurrent data pipelines with backpressure
- [ETL](@/glossary/etl.md) - Extract-Transform-Load pipeline pattern for data integration
- [GenStage](@/glossary/genstage.md) - Demand-driven data exchange between pipeline stages
- [Backpressure](@/glossary/backpressure.md) - Flow control preventing pipeline overload
- [Pipe Operator](@/glossary/pipe-operator.md) - Elixir syntax for function composition, conceptual ancestor
- [Event Sourcing](@/glossary/event-sourcing.md) - Event-based state management complementing pipeline architecture
- [Observability](@/glossary/observability.md) - Monitoring infrastructure for pipeline health and performance
- [Circuit Breaker](@/glossary/circuit-breaker.md) - Resilience pattern for handling external service failures
- [Adapter Pattern](@/glossary/adapter-pattern.md) - Storage abstraction enabling multi-destination pipeline loading

## See Also

- [Architecture](@/architecture/_index.md) - Pipeline architecture patterns and DAG orchestration
- [Technologies](@/technologies/_index.md) - Pipeline implementation technologies and library ecosystem
- [Apps](@/apps/_index.md) - Prismatic applications implementing data pipelines

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)