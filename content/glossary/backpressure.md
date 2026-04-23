+++
title = "Backpressure"
weight = 30
[extra]
category = "pattern"
description = "Flow control mechanism where consumers signal producers to slow down when overwhelmed, preventing buffer overflow and memory exhaustion in data pipelines."
related_terms = ["genstage", "broadway", "otp", "seadf", "stream-processing", "data-pipeline", "circuit-breaker", "fault-tolerance", "supervisor", "observability"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1252
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Backpressure", "Flow", "glossary", "pattern", "Prismatic Platform", "GenStage", "Broadway", "Manual"]
tags = ["glossary", "pattern", "backpressure", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Backpressure - Prismatic Platform"
+++

## Definition

Backpressure is a flow control mechanism in which downstream consumers communicate their processing capacity to upstream producers, preventing faster producers from overwhelming slower consumers. Without backpressure, a fast producer filling unbounded buffers will eventually exhaust available memory, crash the consumer process, or cause silent data loss through dropped messages. Backpressure transforms this failure mode into graceful load adaptation: when a consumer cannot keep up, the producer slows down automatically.

The term originates from fluid dynamics, where backpressure refers to the resistance that fluid encounters when flowing through a pipe. When a pipe narrows, pressure builds upstream, slowing the flow. In software systems, the "pipe" is a message queue or buffer, the "fluid" is data, and the "narrowing" is a slower consumer. Backpressure ensures that the software system behaves like a physical pipe rather than like an overflowing basin.

In the Elixir ecosystem, backpressure is not an afterthought or a library addition -- it is built into the core concurrency model through [GenStage](@/glossary/genstage.md)'s demand-driven architecture. Consumers explicitly request a specific number of events from producers, and producers emit only what is demanded. This pull-based approach contrasts fundamentally with push-based systems (common in imperative languages) that rely on buffering, throttling, or hope to manage flow.

## The Demand-Driven Model

GenStage's demand-driven model inverts the traditional producer-consumer relationship. Instead of producers pushing data to consumers, consumers pull data from producers by issuing demand:

```
Traditional (Push-Based):
  Producer ──[event]──> Buffer ──[event]──> Consumer
  (produces at          (grows              (processes at
   own rate)            unbounded)           own rate)

GenStage (Pull-Based):
  Producer <──[demand]── Consumer
  (emits only            (requests only
   what is               what it can
   demanded)             process)
```

The demand signal flows upstream (from consumer to producer), while events flow downstream (from producer to consumer). This bidirectional communication creates a self-regulating system where production rate automatically adapts to consumption capacity.

```elixir
defmodule PrismaticOSINT.SignalProducer do
  @moduledoc """
  Produces OSINT signals from external sources.
  Only emits events when downstream consumers demand them.
  """
  use GenStage

  def start_link(opts) do
    GenStage.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenStage
  def init(opts) do
    source = Keyword.fetch!(opts, :source)
    {:producer, %{source: source, buffer: []}}
  end

  @impl GenStage
  def handle_demand(demand, %{buffer: buffer, source: source} = state)
      when demand > 0 do
    # Fetch only what is demanded, not more
    {to_emit, remaining} =
      case length(buffer) do
        n when n >= demand ->
          Enum.split(buffer, demand)

        _ ->
          # Need more data - fetch from source
          fresh = fetch_from_source(source, demand - length(buffer))
          combined = buffer ++ fresh
          Enum.split(combined, min(demand, length(combined)))
      end

    {:noreply, to_emit, %{state | buffer: remaining}}
  end

  defp fetch_from_source(source, count) do
    # Fetch exactly `count` items from the external source
    PrismaticOSINT.Source.fetch(source, limit: count)
  end
end
```

## Producer-Consumer Patterns

GenStage defines three process roles that compose into data processing pipelines:

| Role | Behavior | Demand Direction | Event Direction |
|------|----------|-----------------|-----------------|
| **Producer** | Generates events on demand | Receives demand from downstream | Emits events downstream |
| **Producer-Consumer** | Transforms events, passes demand through | Receives demand from downstream, issues demand upstream | Receives events upstream, emits events downstream |
| **Consumer** | Processes events, generates demand | Issues demand upstream | Receives events upstream |

A typical pipeline chains these roles:

```
Producer ──> ProducerConsumer ──> ProducerConsumer ──> Consumer
(fetch)      (transform)         (enrich)            (store)
   ^              ^                   ^                  |
   |              |                   |                  |
   +──demand──────+──────demand───────+─────demand───────+
```

Demand propagates from right to left. The consumer requests N events from the enrichment stage, which requests N events from the transformation stage, which requests N events from the producer. Each stage only processes what was demanded, and the entire pipeline operates at the pace of the slowest stage.

```elixir
defmodule PrismaticOSINT.SignalEnricher do
  @moduledoc """
  Producer-consumer that enriches raw OSINT signals with metadata.
  Passes demand upstream automatically via GenStage.
  """
  use GenStage

  @impl GenStage
  def init(opts) do
    {:producer_consumer, %{enrichment_config: opts[:config]}}
  end

  @impl GenStage
  def handle_events(signals, _from, state) do
    enriched =
      signals
      |> Enum.map(&enrich_signal(&1, state.enrichment_config))
      |> Enum.reject(&is_nil/1)

    {:noreply, enriched, state}
  end

  defp enrich_signal(signal, config) do
    with {:ok, geo} <- lookup_geolocation(signal),
         {:ok, reputation} <- lookup_reputation(signal, config) do
      Map.merge(signal, %{geolocation: geo, reputation: reputation})
    else
      {:error, _reason} -> nil
    end
  end
end
```

## Buffer Management

While GenStage's demand model prevents unbounded buffering by design, real-world systems still need buffers to handle bursty workloads and asynchronous event arrival. GenStage provides configurable buffer management for producers:

| Buffer Parameter | Description | Default | Recommendation |
|-----------------|-------------|---------|----------------|
| `buffer_size` | Maximum events buffered when no demand exists | 10,000 | Size based on memory constraints |
| `buffer_keep` | Which events to keep when buffer is full (`:first` or `:last`) | `:last` | `:last` for real-time data, `:first` for ordered processing |
| `dispatcher` | How events are distributed to multiple consumers | `DemandDispatcher` | `PartitionDispatcher` for parallel processing |

When a producer receives events (from an external source, a callback, or a timer) but has no pending demand from downstream consumers, events are stored in the buffer. If the buffer reaches `buffer_size`, the overflow strategy applies: `:last` keeps the newest events (appropriate for real-time monitoring where stale data is less valuable), `:first` keeps the oldest events (appropriate for ordered processing where sequence matters).

## Broadway: Production-Ready Backpressure

[Broadway](@/glossary/broadway.md) builds on GenStage to provide a higher-level abstraction for concurrent, multi-stage data pipelines with built-in backpressure. Where GenStage is a building block, Broadway is a framework that handles many production concerns automatically:

| Concern | GenStage | Broadway |
|---------|----------|---------|
| **Backpressure** | Manual demand management | Automatic |
| **Batching** | Manual implementation | Built-in configurable batching |
| **Concurrency** | Manual process spawning | Configurable processor/batcher pools |
| **Acknowledgment** | Manual | Built-in ack/reject for message sources |
| **Telemetry** | Manual instrumentation | Built-in telemetry events |
| **Graceful shutdown** | Manual drain logic | Built-in drain on shutdown |

Broadway is the recommended approach for production OSINT pipelines in the Prismatic Platform, where reliable message processing with at-least-once delivery guarantees is essential.

## Real-World OSINT Pipeline Example

The Prismatic Platform's OSINT intelligence gathering demonstrates backpressure in a real-world context. The pipeline processes signals from multiple external sources ([Shodan](@/glossary/shodan.md), [Censys](@/glossary/censys.md), [GreyNoise](@/glossary/greynoise.md), DNS resolvers) through enrichment, validation, and storage stages.

The challenge: external sources can produce data at highly variable rates. A Shodan scan might return thousands of results in seconds, while a DNS resolution stage processes records one at a time with network latency. Without backpressure, the Shodan producer would buffer thousands of results, exhausting memory while the DNS stage processes them slowly.

```
External Sources          Processing Pipeline           Storage
+─────────+
| Shodan  |─────+
+─────────+     |    +───────────+   +──────────+   +─────────+
                ├───>| Normalize |──>| Enrich   |──>| Store   |
+─────────+     |    | (fast)    |   | (slow:   |   | (medium)|
| Censys  |─────+    +───────────+   | DNS,geo) |   +─────────+
+─────────+     |         ^          +──────────+        |
                |         |               ^              |
+─────────+     |         +──demand───────+──demand──────+
|GreyNoise|─────+
+─────────+
```

With backpressure:
1. The Store consumer requests 50 events from Enrich
2. Enrich requests 50 events from Normalize (it can batch efficiently)
3. Normalize requests 50 events from the external source producers
4. External source producers fetch exactly 50 records from their APIs
5. When Store finishes processing 50 events, it requests 50 more
6. The pipeline operates at the pace of the slowest stage (Enrich, due to DNS latency)

No stage accumulates unbounded data. No buffer grows without limit. Memory usage is predictable and stable regardless of how fast external sources can produce data.

## Backpressure vs. Rate Limiting

Backpressure and [rate limiting](@/glossary/rate-limiting.md) both control the rate of data flow, but they differ in mechanism and purpose:

| Dimension | Backpressure | Rate Limiting |
|-----------|-------------|---------------|
| **Direction** | Consumer controls producer (pull) | System controls caller (push rejection) |
| **Mechanism** | Demand signals propagate upstream | Request counter with time window |
| **Adaptation** | Continuous, proportional to capacity | Binary: allowed or rejected |
| **Data loss** | None (producer waits for demand) | Rejected requests may be lost |
| **Use case** | Internal pipeline flow control | External API protection |
| **Who benefits** | Both producer and consumer | The protected service |

In the Prismatic Platform, both patterns are used at different boundaries. Backpressure controls flow within internal pipelines (GenStage/Broadway). Rate limiting controls access at external API boundaries (preventing abuse of the platform's endpoints). They are complementary, not competing, patterns.

## Monitoring and Observability

Backpressure behavior is monitored through the platform's [observability](@/glossary/observability.md) infrastructure. Key metrics include:

| Metric | Indicates | Healthy Range | Alert Threshold |
|--------|-----------|---------------|-----------------|
| **Demand pending** | Consumer appetite not yet satisfied | 0-100 | >1000 sustained |
| **Buffer size** | Events waiting for demand | 0-1000 | >5000 |
| **Processing latency** | Time from event arrival to processing | <100ms | >1s |
| **Throughput** | Events processed per second | Application-specific | <50% of baseline |
| **Demand ratio** | Demand issued vs. events received | ~1.0 | <0.5 or >2.0 |

A sustained high buffer size with low demand indicates a bottleneck: the consumer cannot keep up, and the producer is buffering. A sustained low buffer size with high demand indicates underutilization: the consumer is waiting for data that the producer cannot supply fast enough. Both situations warrant investigation and potential pipeline reconfiguration.

## Relationship to Stream Processing

Backpressure is one of three pillars of robust [stream processing](@/glossary/stream-processing.md) in the Prismatic Platform:

1. **Backpressure** ensures flow control -- no stage is overwhelmed
2. **[Fault tolerance](@/glossary/fault-tolerance.md)** ensures crash recovery -- failed stages are restarted by [supervisors](@/glossary/supervisor.md)
3. **[Circuit breakers](@/glossary/circuit-breaker.md)** ensure external boundary protection -- degraded dependencies are isolated

Together, these patterns create data pipelines that are resilient to load spikes (backpressure), internal failures (supervision), and external dependency degradation (circuit breakers). The combination is more robust than any individual pattern, and the Prismatic Platform applies all three in its production intelligence-gathering pipelines.

## Related Terms

- [GenStage](@/glossary/genstage.md) -- Elixir library implementing the demand-driven backpressure model
- [Broadway](@/glossary/broadway.md) -- Production framework building on GenStage with built-in backpressure
- [Stream Processing](@/glossary/stream-processing.md) -- Processing paradigm where backpressure is essential
- [Data Pipeline](@/glossary/data-pipeline.md) -- Architecture pattern using backpressure for flow control
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- Complementary pattern protecting external boundaries
- [Fault Tolerance](@/glossary/fault-tolerance.md) -- System property maintained alongside backpressure
- [Supervisor](@/glossary/supervisor.md) -- Recovery mechanism for crashed pipeline stages
- [Rate Limiting](@/glossary/rate-limiting.md) -- Related pattern controlling external access rates
- [SEADF](@/glossary/seadf.md) -- Platform framework implementing backpressure in scanning pipelines
- [OTP](@/glossary/otp.md) -- Runtime providing the process model for backpressure
- [Observability](@/glossary/observability.md) -- Monitoring infrastructure tracking backpressure metrics
- [Metrics](@/glossary/metrics.md) -- Measurements used to monitor backpressure health

## See Also

- [Architecture](@/architecture/_index.md) -- Platform data pipeline architecture
- [Technologies](@/technologies/_index.md) -- GenStage, Broadway, and BEAM technology details
- [Capabilities](@/capabilities/_index.md) -- Platform data processing capabilities

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)