+++
title = "Stream Processing"
weight = 39
[extra]
category = "architecture"
description = "Continuous processing of data records as they arrive rather than in accumulated batches, enabling real-time analytics and event-driven architectures"
related_terms = ["data-pipeline", "broadway", "genstage", "event-sourcing", "backpressure", "etl", "liveview", "pubsub", "genserver", "supervisor", "telemetry", "observability"]
keywords = ["stream processing Elixir", "Broadway GenStage pipeline", "real-time data processing", "event stream architecture", "backpressure flow control", "windowing strategies", "exactly-once delivery", "OSINT data streaming"]
tags = ["stream-processing", "broadway", "genstage", "real-time", "data-pipeline", "event-driven"]
difficulty = "advanced"
audience = ["data-engineers", "backend-engineers", "distributed-systems-architects"]
version = "2.0.0"
last_updated = "2026-02-22"
tldr = "Stream processing enables continuous, low-latency data processing with backpressure and fault tolerance, implemented in the Prismatic Platform via GenStage and Broadway pipelines."
prerequisites = ["genserver", "otp-basics", "concurrency", "message-passing"]
use_cases = ["osint-intelligence-feeds", "security-event-monitoring", "certificate-transparency", "real-time-dashboards", "etl-pipelines"]
platform_usage = "high"
platform_components = ["PrismaticOsint.SecurityFeedPipeline", "PrismaticPerimeter.AssetDiscovery", "PrismaticWeb.LiveView"]
paradigm = "event-driven"
key_libraries = ["Broadway", "GenStage", "Flow"]
delivery_guarantees = ["at-most-once", "at-least-once", "exactly-once"]
estimated_reading_time = "14 minutes"
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1737
date_created = "2026-02-23"
date_modified = "2026-02-23"
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Stream Processing - Prismatic Platform"
+++

## Definition and Overview

Stream processing is a data processing paradigm in which records are processed continuously and incrementally as they arrive, rather than being accumulated into finite batches for periodic processing. A stream processing system ingests an unbounded sequence of events, applies transformations, aggregations, or analyses to each event (or small groups of events), and produces results with minimal latency. The fundamental distinction from batch processing is temporal: batch systems process data at rest, while stream systems process data in motion.

Stream processing systems must address several challenges that do not arise in batch processing. Events may arrive out of order due to network delays or distributed clock skew, requiring windowing strategies and watermark mechanisms to determine when a time-based aggregation is complete. Processing must handle failures gracefully without losing or duplicating events, demanding exactly-once or at-least-once delivery guarantees. And throughput must be managed dynamically through [backpressure](/glossary/backpressure/) mechanisms that slow producers when consumers cannot keep pace, preventing memory exhaustion and cascading failures.

The [BEAM](/glossary/beam/) virtual machine and the Elixir ecosystem provide a uniquely strong foundation for stream processing. The lightweight process model (millions of concurrent processes with microsecond scheduling), built-in distribution, and fault-tolerant supervision trees address many stream processing challenges at the runtime level. Libraries like [GenStage](/glossary/genstage/) and [Broadway](/glossary/broadway/) build on this foundation to provide demand-driven, backpressure-aware stream processing with production-grade reliability.

## Historical Context and Evolution

Stream processing has evolved through several generations, each addressing limitations of its predecessors. The first generation, represented by systems like Apache Storm (2011), provided low-latency processing but with limited exactly-once guarantees and complex fault recovery. The second generation, exemplified by Apache Spark Streaming (2013), used micro-batching to achieve better fault tolerance at the cost of higher latency. The third generation, led by Apache Flink (2014) and Apache Kafka Streams (2016), achieved true event-at-a-time processing with strong consistency guarantees and sophisticated windowing.

The Elixir ecosystem takes a different approach entirely. Rather than building monolithic stream processing frameworks, it provides composable building blocks that leverage the BEAM's native concurrency model. GenStage (2016) provides the foundational demand-driven data exchange protocol. Broadway (2019) adds production concerns like batching, graceful shutdown, and telemetry on top of GenStage. Flow (2016) provides parallel data processing for bounded datasets. These tools compose naturally with OTP supervision, [GenServer](/glossary/genserver/) state management, and Phoenix [PubSub](/glossary/pubsub/) for real-time UI updates. The result is an integrated streaming architecture that lives within the application rather than requiring a separate cluster.

## Batch vs Stream Processing

Understanding the tradeoffs between batch and stream processing is essential for choosing the right approach for a given workload.

| Dimension | Batch Processing | Stream Processing |
|-----------|-----------------|-------------------|
| **Input** | Bounded dataset (finite) | Unbounded event stream (infinite) |
| **Latency** | Minutes to hours | Milliseconds to seconds |
| **Completeness** | All data available before processing | Data arrives continuously, may be late |
| **State** | Recomputed per batch | Maintained incrementally |
| **Fault recovery** | Reprocess entire batch | Checkpoint and resume from offset |
| **Throughput** | Optimized for total volume | Optimized for per-event speed |
| **Ordering** | Guaranteed (data is sorted) | Must be managed (watermarks, windows) |
| **Resource usage** | Bursty (peaks during batch runs) | Steady (continuous processing) |

Modern architectures, including the Prismatic Platform, often combine both: stream processing handles real-time intelligence feeds and security monitoring, while batch processing handles periodic bulk analyses like comprehensive asset inventory reconciliation and historical trend computation.

## Windowing Strategies

Windowing partitions an unbounded stream into finite chunks for aggregation. The choice of windowing strategy determines how events are grouped and when results are emitted.

### Tumbling Windows

Tumbling (or fixed) windows divide the stream into non-overlapping, fixed-size time intervals. Each event belongs to exactly one window.

```
Time:     |--W1--|--W2--|--W3--|--W4--|
Events:   * * *  | * *  | * * *| *   |
Output:       3      2      3     1
```

Use case: Computing per-minute event counts for security monitoring dashboards.

### Sliding Windows

Sliding windows overlap, defined by a window size and a slide interval. An event may belong to multiple windows simultaneously.

```
Window size: 10min, Slide: 5min
Time:     |----W1----|
               |----W2----|
                    |----W3----|
```

Use case: Calculating rolling averages for security rating trends with smooth transitions.

### Session Windows

Session windows are data-driven, grouping events that are close together in time with gaps defining session boundaries. Window size is variable, determined by the data itself.

```
Events:   ** * *      *** **         *  * *
Sessions: |--S1--|    |--S2--|      |--S3--|
          (gap)       (gap)         (gap)
```

Use case: Grouping related OSINT findings from a single reconnaissance session against a target domain.

### Window Summary

| Window Type | Size | Overlap | Trigger | Best For |
|-------------|------|---------|---------|----------|
| Tumbling | Fixed | None | Time boundary | Regular aggregations |
| Sliding | Fixed | Yes (by slide) | Slide interval | Smooth trending |
| Session | Variable | None | Gap timeout | Activity-based grouping |
| Global | Unbounded | N/A | Watermark/trigger | Full-stream aggregation |

## Watermarks and Late Data

In distributed systems, events may arrive after the window to which they logically belong has already been processed. Watermarks provide a mechanism for reasoning about event-time completeness.

A watermark is a monotonically advancing timestamp that asserts: "all events with timestamps before this value have been observed." When a watermark advances past a window's end time, the system can safely emit results for that window.

```
Event time:    |---Window---|
Processing:    * * * [watermark advances past window end] * (late event)
                     ^-- emit window results here
                                                          ^-- handle as late data
```

Late data handling strategies include:

| Strategy | Description | Tradeoff |
|----------|-------------|----------|
| **Drop** | Discard late events | Simple, may lose data |
| **Recompute** | Re-emit corrected window results | Accurate, downstream complexity |
| **Side output** | Route late data to separate stream | Flexible, requires dual processing |
| **Allowed lateness** | Accept late events within a grace period | Balanced, bounded delay |

In the Prismatic Platform, the allowed lateness strategy is preferred for OSINT data streams, where API responses from providers like Shodan and Censys may arrive with variable latency. A configurable grace period (typically 30-60 seconds) accommodates normal network variability without sacrificing timeliness.

## Delivery Guarantees

Stream processing systems provide different levels of delivery guarantees, each with distinct implementation complexity and performance characteristics.

| Guarantee | Description | Implementation Cost | Data Accuracy |
|-----------|-------------|-------------------|---------------|
| **At-most-once** | Events may be lost, never duplicated | Lowest | May miss events |
| **At-least-once** | Events never lost, may be duplicated | Moderate | May count events twice |
| **Exactly-once** | Events processed exactly once | Highest | Perfect accuracy |

True exactly-once semantics require coordination between the stream processor and external systems (databases, message queues). Broadway achieves effectively-exactly-once processing through a combination of:

1. **Acknowledgment tracking**: Each message is acknowledged only after successful processing and persistence
2. **Idempotent writes**: Storage operations use unique event identifiers to detect and skip duplicates
3. **Checkpoint-based recovery**: On failure, processing resumes from the last acknowledged checkpoint

```elixir
defmodule PrismaticOsint.IdempotentWriter do
  @moduledoc """
  Demonstrates idempotent write pattern for exactly-once semantics.
  Uses event_id as deduplication key to prevent duplicate processing.
  """

  @spec write_finding(map()) :: {:ok, map()} | {:error, :duplicate} | {:error, term()}
  def write_finding(%{event_id: event_id} = finding) do
    case PrismaticStorage.Repo.get_by(Finding, event_id: event_id) do
      nil ->
        %Finding{}
        |> Finding.changeset(finding)
        |> PrismaticStorage.Repo.insert()

      _existing ->
        {:error, :duplicate}
    end
  end
end
```

## GenStage and Broadway in Elixir

The Elixir ecosystem's approach to stream processing is built on two complementary libraries that leverage BEAM's process model.

### GenStage

[GenStage](/glossary/genstage/) is the foundational library implementing demand-driven data exchange between Elixir processes. It defines three process roles:

```elixir
defmodule PrismaticOsint.Producer do
  @moduledoc """
  GenStage producer that generates OSINT events from external sources.
  Produces events only when downstream consumers request them.
  """

  use GenStage

  @impl GenStage
  def init(opts) do
    {:producer, %{source: opts[:source], buffer: []}}
  end

  @impl GenStage
  def handle_demand(demand, state) when demand > 0 do
    events = fetch_osint_events(state.source, demand)
    {:noreply, events, update_state(state, events)}
  end
end

defmodule PrismaticOsint.Enrichment do
  @moduledoc """
  GenStage producer-consumer that enriches OSINT events with
  contextual information from multiple intelligence sources.
  """

  use GenStage

  @impl GenStage
  def init(_opts), do: {:producer_consumer, %{}}

  @impl GenStage
  def handle_events(events, _from, state) do
    enriched = Enum.map(events, &enrich_with_context/1)
    {:noreply, enriched, state}
  end
end

defmodule PrismaticOsint.StorageConsumer do
  @moduledoc """
  GenStage consumer that persists processed OSINT findings
  to the authoritative PostgreSQL store.
  """

  use GenStage

  @impl GenStage
  def init(_opts), do: {:consumer, %{}}

  @impl GenStage
  def handle_events(events, _from, state) do
    Enum.each(events, &persist_finding/1)
    {:noreply, [], state}
  end
end
```

The demand-driven model means consumers request events from upstream producers, creating natural [backpressure](/glossary/backpressure/): if a consumer is slow, it requests fewer events, which propagates upstream to slow the producer. No events are buffered beyond what consumers have explicitly requested.

### Broadway

[Broadway](/glossary/broadway/) builds on GenStage to provide a higher-level abstraction for production stream processing pipelines:

```elixir
defmodule PrismaticOsint.SecurityFeedPipeline do
  @moduledoc """
  Production Broadway pipeline for processing security event feeds.
  Supports multiple batchers for routing events to different storage backends.
  """

  use Broadway

  @spec start_link(keyword()) :: {:ok, pid()} | {:error, term()}
  def start_link(_opts) do
    Broadway.start_link(__MODULE__,
      name: __MODULE__,
      producer: [
        module: {BroadwayKafka.Producer, hosts: [...], topics: ["security-events"]},
        concurrency: 4
      ],
      processors: [
        default: [concurrency: 16, max_demand: 10]
      ],
      batchers: [
        postgresql: [concurrency: 4, batch_size: 100, batch_timeout: 1000],
        meilisearch: [concurrency: 2, batch_size: 50, batch_timeout: 2000]
      ]
    )
  end

  @impl Broadway
  def handle_message(:default, message, _context) do
    enriched = enrich_security_event(message.data)
    message
    |> Broadway.Message.update_data(fn _ -> enriched end)
    |> Broadway.Message.put_batcher(select_batcher(enriched))
  end

  @impl Broadway
  def handle_batch(:postgresql, messages, _batch_info, _context) do
    records = Enum.map(messages, & &1.data)
    PrismaticStorage.Ecto.bulk_insert(records)
    messages
  end

  @impl Broadway
  def handle_batch(:meilisearch, messages, _batch_info, _context) do
    documents = Enum.map(messages, & &1.data)
    PrismaticStorage.Meilisearch.index_documents(documents)
    messages
  end

  defp select_batcher(%{severity: severity}) when severity in [:critical, :high], do: :postgresql
  defp select_batcher(_event), do: :meilisearch
end
```

Broadway adds automatic batching, graceful shutdown, [telemetry](/glossary/telemetry/) integration, and rate limiting on top of GenStage's demand-driven foundation.

## OSINT Data Streams in Prismatic

The Prismatic Platform processes several categories of real-time data streams using the Broadway/GenStage infrastructure.

| Stream | Source | Volume | Processing | Destination |
|--------|--------|--------|------------|-------------|
| Security events | EASM scanners | ~10K/hour | Enrichment, scoring | PostgreSQL, LiveView |
| OSINT feeds | Shodan, Censys, GreyNoise | Variable | Normalization, dedup | Meilisearch, KuzuDB |
| Certificate transparency | CT log monitors | ~100K/day | Domain matching | Asset inventory |
| DNS changes | Passive DNS feeds | ~50K/day | Anomaly detection | Alert pipeline |
| Quality telemetry | Platform instrumentation | Continuous | Aggregation, trending | ETS, dashboards |

Each stream is implemented as a supervised Broadway pipeline with independent concurrency settings, failure handling, and [backpressure](/glossary/backpressure/) configuration. The OTP [supervision tree](/glossary/supervision-tree/) ensures that a failure in one stream pipeline does not affect others thanks to [process isolation](/glossary/process-isolation/).

## LiveView Real-Time Integration

Stream processing results feed directly into Phoenix [LiveView](/glossary/liveview/) dashboards through [PubSub](/glossary/pubsub/) broadcasts. When a Broadway pipeline processes a security event, it publishes the result to a PubSub topic. LiveView processes subscribed to that topic receive the update and push it to the browser over WebSocket, achieving end-to-end latency from event ingestion to UI update measured in milliseconds.

```elixir
defmodule PrismaticWeb.PerimeterDashboardLive do
  @moduledoc """
  LiveView dashboard receiving real-time security event updates
  from Broadway pipelines via PubSub. Zero-polling architecture.
  """

  use PrismaticWeb, :live_view

  @impl Phoenix.LiveView
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "security:ratings:all")
      Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "security:events:latest")
    end

    {:ok, assign(socket, ratings: [], events: [])}
  end

  @impl Phoenix.LiveView
  def handle_info({:rating_updated, rating}, socket) do
    {:noreply, update(socket, :ratings, fn ratings ->
      [rating | ratings] |> Enum.take(50)
    end)}
  end

  @impl Phoenix.LiveView
  def handle_info({:security_event, event}, socket) do
    {:noreply, update(socket, :events, fn events ->
      [event | events] |> Enum.take(100)
    end)}
  end
end
```

This architecture eliminates polling entirely: the Prismatic Perimeter dashboard at `/perimeter` displays real-time security ratings, asset discovery progress, and compliance status with zero client-side polling overhead.

## Error Handling and Dead Letter Queues

Production stream processing pipelines must handle messages that consistently fail processing. Rather than retrying indefinitely or dropping failed messages silently, the dead letter queue (DLQ) pattern routes failed messages to a separate store for investigation:

```elixir
defmodule PrismaticOsint.DeadLetterHandler do
  @moduledoc """
  Handles messages that fail processing after exhausting retries.
  Routes to dead letter storage for manual investigation and replay.
  """

  @spec handle_failed_message(Broadway.Message.t(), term()) :: :ok
  def handle_failed_message(message, reason) do
    dead_letter = %{
      original_data: message.data,
      failure_reason: inspect(reason),
      failed_at: DateTime.utc_now(),
      pipeline: message.metadata[:pipeline],
      retry_count: message.metadata[:retry_count] || 0
    }

    PrismaticStorage.Repo.insert!(%DeadLetter{} |> DeadLetter.changeset(dead_letter))

    :telemetry.execute(
      [:prismatic, :pipeline, :dead_letter],
      %{count: 1},
      %{pipeline: dead_letter.pipeline, reason: dead_letter.failure_reason}
    )
  end
end
```

## Monitoring and Observability

Stream processing pipelines require comprehensive [observability](/glossary/observability/) to detect processing delays, backpressure buildup, and throughput degradation.

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| Processing latency | Time from event ingestion to output | > 5 seconds |
| Backpressure ratio | Demand vs supply rate | < 0.5 (consumer starving) |
| Failed message rate | Percentage of messages failing processing | > 1% |
| Batch completion time | Time to process a single batch | > 10 seconds |
| Queue depth | Messages waiting in producer buffer | > 10,000 |
| Consumer utilization | Percentage of time consumers are busy | > 90% sustained |
| Dead letter rate | Messages routed to DLQ per minute | > 10/minute |

Broadway integrates with [Telemetry](/glossary/telemetry/), emitting events at each pipeline stage that the platform's observability infrastructure collects, aggregates, and visualizes.

```elixir
defmodule PrismaticTelemetry.PipelineMetrics do
  @moduledoc """
  Attaches telemetry handlers for Broadway pipeline monitoring.
  Tracks throughput, latency, and error rates across all pipelines.
  """

  @spec attach() :: :ok
  def attach do
    :telemetry.attach_many("pipeline-metrics", [
      [:broadway, :processor, :start],
      [:broadway, :processor, :stop],
      [:broadway, :processor, :exception],
      [:broadway, :batcher, :start],
      [:broadway, :batcher, :stop]
    ], &handle_event/4, %{})
  end

  defp handle_event([:broadway, :processor, :stop], measurements, metadata, _config) do
    :telemetry.execute(
      [:prismatic, :pipeline, :processor_duration],
      %{duration_ms: System.convert_time_unit(measurements.duration, :native, :millisecond)},
      %{pipeline: metadata.name}
    )
  end
end
```

## Performance Tuning

Tuning Broadway pipelines involves balancing concurrency, batch size, and demand settings for optimal throughput and latency:

| Parameter | Effect of Increasing | Effect of Decreasing |
|-----------|---------------------|---------------------|
| `processor.concurrency` | Higher throughput, more memory | Lower throughput, less resource usage |
| `batcher.batch_size` | Better bulk write efficiency | Lower latency per event |
| `batcher.batch_timeout` | Larger batches (waits longer) | Faster emission of partial batches |
| `processor.max_demand` | More events per processor cycle | Finer-grained backpressure |
| `producer.concurrency` | More parallel source reads | Fewer connections to source |

## Comparison with External Frameworks

| Framework | Language | Backpressure | Fault Tolerance | Deployment |
|-----------|----------|-------------|-----------------|------------|
| **Broadway** | Elixir | Built-in (GenStage demand) | OTP supervision | Embedded in application |
| **Apache Kafka Streams** | Java | Topic partitions | Changelog topics | Embedded in application |
| **Apache Flink** | Java/Scala | Network buffers | Checkpointing | Standalone cluster |
| **Apache Spark Streaming** | Scala/Java | Micro-batch sizing | RDD lineage replay | Standalone cluster |
| **Akka Streams** | Scala | Reactive Streams | Actor supervision | Embedded in application |

Broadway's key advantage is integration with the OTP ecosystem: pipelines are supervised processes that restart on failure, communicate via message passing, and compose naturally with [GenServers](/glossary/genserver/), [ETS](/glossary/ets-table/) caches, and Phoenix LiveView. This eliminates the operational complexity of maintaining a separate stream processing cluster.

## Related Terms

- [Data Pipeline](/glossary/data-pipeline/) -- General pipeline pattern including both batch and stream processing
- [Broadway](/glossary/broadway/) -- Elixir library for concurrent stream processing with batching and backpressure
- [GenStage](/glossary/genstage/) -- Demand-driven data exchange powering stream pipelines
- [Backpressure](/glossary/backpressure/) -- Flow control preventing stream processing overload
- [ETL](/glossary/etl/) -- Extract-Transform-Load pattern, often implemented as streaming pipeline
- [Event Sourcing](/glossary/event-sourcing/) -- Event-based state management complementing stream processing
- [LiveView](/glossary/liveview/) -- Real-time UI consuming processed stream data
- [PubSub](/glossary/pubsub/) -- Internal message distribution bridging pipelines and consumers
- [Telemetry](/glossary/telemetry/) -- Observability infrastructure for pipeline health monitoring
- [Observability](/glossary/observability/) -- Monitoring infrastructure for stream pipeline health
- [GenServer](/glossary/genserver/) -- Process model underlying GenStage producers and consumers
- [Process Isolation](/glossary/process-isolation/) -- BEAM property enabling independent pipeline stage failures

## See Also

- [Architecture](/architecture/) -- Streaming architecture patterns and pipeline topology
- [Technologies](/technologies/) -- Stream processing stack and library ecosystem
- [Apps](/apps/) -- Prismatic applications implementing stream processing pipelines

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
