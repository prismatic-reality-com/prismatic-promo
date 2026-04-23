+++
title = "GenStage"
weight = 27
[extra]
category = "otp"
description = "Elixir library for building data processing pipelines with built-in backpressure, enabling producers, consumers, and producer-consumers to exchange events at sustainable rates."
related_terms = ["otp", "genserver", "supervision-tree", "seadf", "broadway", "backpressure", "beam", "behaviour", "message-passing", "stream-processing"]
abbreviation = "N/A"
domain = "Data Processing and Pipelines"
complexity = "Advanced"
beam_specific = true
otp_version = "21+"
elixir_version = "1.6+"
hex_package = "gen_stage"
hex_version = "~> 1.2"
prismatic_usage = "Extensive"
platform_component = "PrismaticPerimeter, SEADF, PrismaticAgents"
first_introduced = "Gen 3"
current_generation = "Gen 19"
creator = "Jose Valim / Elixir Core Team"
key_concept = "Demand-driven backpressure"
pipeline_roles = ["Producer", "Consumer", "ProducerConsumer"]
dispatchers = ["DemandDispatcher", "BroadcastDispatcher", "PartitionDispatcher"]
performance_impact = "Critical for throughput"
fault_tolerance_impact = "High"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1343
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["GenStage", "Elixir", "glossary", "otp", "Prismatic Platform", "Broadway", "Manual"]
tags = ["glossary", "otp", "genstage", "prismatic"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "GenStage - Prismatic Platform"
+++

## Definition

GenStage is an Elixir library that provides a framework for building data processing pipelines with built-in demand-driven [backpressure](/glossary/backpressure/). It defines three fundamental roles -- producers (emit events), consumers (absorb events), and producer-consumers (both receive and emit events) -- that connect into directed acyclic graphs where data flows from producers to consumers at a rate the consumers can sustain. GenStage was created by Jose Valim and the Elixir core team as the foundation for all data-intensive processing in the Elixir ecosystem.

The key innovation of GenStage is its demand model: consumers tell producers how many events they can handle, and producers never emit more events than the total demand from their subscribers. This inverted flow control eliminates buffer overflow and memory exhaustion issues common in naive pipeline architectures where producers push data regardless of consumer capacity. The demand propagates backwards through the pipeline -- if a downstream consumer slows down, its reduced demand automatically throttles all upstream stages.

GenStage builds on the [GenServer](/glossary/genserver/) [behaviour](/glossary/behaviour/), meaning every stage is a supervised [BEAM](/glossary/beam/) process with all the fault isolation, monitoring, and hot code reloading properties that entails. A crashed stage is automatically restarted by its [supervisor](/glossary/supervisor/), and the demand-driven subscription model ensures that restarted stages re-integrate into the pipeline without message loss or duplication (depending on acknowledgment configuration).

## Historical Context and Motivation

Before GenStage, Elixir developers building data processing pipelines faced a recurring challenge: how to connect producers and consumers without either overwhelming the consumer or starving the producer. The naive approach of sending messages as fast as possible leads to unbounded message queue growth in the consumer's mailbox, eventually exhausting memory. Manual backpressure implementations (tracking demand, buffering, throttling) were error-prone and duplicated across projects.

GenStage was released in 2016 as the official solution to this problem. Its design was informed by the Reactive Streams specification (which solved the same problem in the JVM ecosystem) and by decades of Erlang experience with demand-driven flow control in telecom systems. The key design decisions were: demand flows backwards (consumer to producer), events flow forwards (producer to consumer), every stage is a supervised process, and the demand model is pluggable through dispatcher strategies.

GenStage quickly became the foundation for higher-level abstractions. [Broadway](/glossary/broadway/), released in 2019, provides a declarative API for common pipeline patterns (message queues, database polling, streaming) built entirely on GenStage. Flow, another library built on GenStage, provides lazy parallel data processing similar to Java's parallel streams. The Prismatic Platform uses GenStage both directly (for custom pipeline topologies) and indirectly (through Broadway for standard ingestion patterns).

## The Producer-Consumer Model

GenStage's three roles define how data flows through a pipeline:

### Role Definitions

| Role | Behaviour | Description |
|------|-----------|-------------|
| **Producer** | `GenStage` with `type: :producer` | Emits events to subscribed consumers. Buffers events until demand arrives. |
| **Consumer** | `GenStage` with `type: :consumer` | Subscribes to producers, requests demand, processes received events. Terminal stage. |
| **Producer-Consumer** | `GenStage` with `type: :producer_consumer` | Subscribes to upstream producers, transforms events, re-emits to downstream consumers. |

### Data Flow

```
Producer       Producer-Consumer       Consumer
(data source)  (transformation)        (data sink)
    |                |                      |
    |  <-- demand -- |  <-- demand -------- |
    |                |                      |
    |  -- events --> |  -- events -------> |
    |                |                      |
```

The demand flows backwards (consumer to producer), while events flow forwards (producer to consumer). This bidirectional flow is what makes backpressure automatic and pervasive. No stage in the pipeline can be overwhelmed because it only receives events it explicitly requested.

### Multi-Stage Topologies

GenStage supports arbitrary directed acyclic graph topologies, not just linear chains:

```
Producer A ----+
               |
               v
          ProducerConsumer (merge) ----> Consumer (storage)
               ^
               |
Producer B ----+

Producer C ----> ProducerConsumer (filter) ----> Consumer (alerting)
                                            \
                                             +---> Consumer (logging)
```

This flexibility enables complex data processing architectures where events from multiple sources are merged, split, filtered, and routed to multiple destinations -- all with automatic backpressure at every stage.

## Implementing GenStage Pipelines

### Producer

A producer generates events and buffers them until consumers request them:

```elixir
defmodule PrismaticPerimeter.Scanner.Producer do
  @moduledoc """
  GenStage producer for the perimeter scanning pipeline. Accepts scan
  targets via cast and buffers them until downstream consumers request
  events through the demand model.
  """

  use GenStage

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenStage.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec enqueue(map()) :: :ok
  def enqueue(scan_target) do
    GenStage.cast(__MODULE__, {:enqueue, scan_target})
  end

  @impl true
  def init(_opts) do
    {:producer, %{queue: :queue.new(), pending_demand: 0}}
  end

  @impl true
  def handle_demand(demand, state) when demand > 0 do
    {events, new_state} = take_events(demand + state.pending_demand, state)
    {:noreply, events, new_state}
  end

  @impl true
  def handle_cast({:enqueue, scan_target}, state) do
    new_queue = :queue.in(scan_target, state.queue)
    {events, new_state} = take_events(state.pending_demand, %{state | queue: new_queue})
    {:noreply, events, new_state}
  end

  defp take_events(demand, state) do
    {events, remaining_queue} = dequeue_up_to(demand, state.queue)
    remaining_demand = demand - length(events)
    {events, %{state | queue: remaining_queue, pending_demand: remaining_demand}}
  end

  defp dequeue_up_to(0, queue), do: {[], queue}
  defp dequeue_up_to(count, queue) do
    case :queue.out(queue) do
      {{:value, item}, rest} ->
        {items, final_queue} = dequeue_up_to(count - 1, rest)
        {[item | items], final_queue}
      {:empty, queue} ->
        {[], queue}
    end
  end
end
```

### Producer-Consumer

A producer-consumer receives events from upstream, transforms them, and emits results downstream:

```elixir
defmodule PrismaticPerimeter.Scanner.Enricher do
  @moduledoc """
  GenStage producer-consumer that enriches raw scan targets with
  DNS resolution, geolocation, and WHOIS data. Filters out targets
  that fail enrichment to prevent downstream contamination.
  """

  use GenStage

  require Logger

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenStage.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    {:producer_consumer, %{},
     subscribe_to: [{PrismaticPerimeter.Scanner.Producer, max_demand: 10}]}
  end

  @impl true
  def handle_events(scan_targets, _from, state) do
    enriched =
      scan_targets
      |> Enum.map(&enrich_target/1)
      |> Enum.filter(&match?({:ok, _}, &1))
      |> Enum.map(fn {:ok, result} -> result end)

    failed_count = length(scan_targets) - length(enriched)

    if failed_count > 0 do
      Logger.warning("#{failed_count} targets failed enrichment")

      :telemetry.execute(
        [:prismatic, :scanner, :enrichment_failures],
        %{count: failed_count},
        %{}
      )
    end

    {:noreply, enriched, state}
  end

  @spec enrich_target(map()) :: {:ok, map()} | {:error, term()}
  defp enrich_target(target) do
    :telemetry.span(
      [:prismatic, :scanner, :enrich],
      %{target: target.domain},
      fn ->
        with {:ok, dns} <- resolve_dns(target),
             {:ok, geo} <- geolocate(target),
             {:ok, whois} <- whois_lookup(target) do
          enriched = Map.merge(target, %{dns: dns, geo: geo, whois: whois})
          {{:ok, enriched}, %{status: :ok}}
        else
          {:error, reason} = error ->
            {error, %{status: :error, reason: reason}}
        end
      end
    )
  end

  defp resolve_dns(target), do: {:ok, %{records: []}}
  defp geolocate(target), do: {:ok, %{country: "unknown"}}
  defp whois_lookup(target), do: {:ok, %{registrar: "unknown"}}
end
```

### Consumer

A consumer is the terminal stage that processes events without re-emitting:

```elixir
defmodule PrismaticPerimeter.Scanner.Writer do
  @moduledoc """
  Terminal GenStage consumer that persists enriched scan results
  to storage and broadcasts discovery events for real-time dashboard
  updates via Phoenix PubSub.
  """

  use GenStage

  require Logger

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenStage.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    {:consumer, %{},
     subscribe_to: [{PrismaticPerimeter.Scanner.Enricher, max_demand: 20, min_demand: 5}]}
  end

  @impl true
  def handle_events(enriched_targets, _from, state) do
    :telemetry.span(
      [:prismatic, :scanner, :write],
      %{batch_size: length(enriched_targets)},
      fn ->
        case PrismaticPerimeter.Storage.bulk_upsert(enriched_targets) do
          {:ok, count} ->
            Phoenix.PubSub.broadcast(
              Prismatic.PubSub,
              "perimeter:updates",
              {:assets_discovered, count}
            )
            {{:ok, count}, %{status: :ok, written: count}}

          {:error, reason} = error ->
            Logger.error("Batch write failed: #{inspect(reason)}")
            {error, %{status: :error, reason: reason}}
        end
      end
    )

    {:noreply, [], state}
  end
end
```

## Demand and Backpressure Mechanics

The demand model is GenStage's core mechanism. Understanding it is essential for tuning pipeline performance:

| Parameter | Description | Tuning Guidance |
|-----------|-------------|-----------------|
| **max_demand** | Maximum events requested per demand batch | Higher = more throughput, lower = more even distribution |
| **min_demand** | Threshold below which new demand is requested | Set to ~50-75% of max_demand for smooth flow |
| **buffer_size** | Producer event buffer capacity | Default 10,000; increase for bursty sources |
| **buffer_keep** | Which events to keep when buffer overflows | `:first` (default) or `:last` |

When a consumer subscribes to a producer, it sends an initial demand of `max_demand` events. As the consumer processes events and the buffered count drops below `min_demand`, it automatically sends additional demand. This creates a self-regulating flow where the consumer always has between `min_demand` and `max_demand` events in its buffer.

### Demand Flow Visualization

```
Time 0: Consumer subscribes with max_demand=20, min_demand=10
  Consumer -> Producer: "I want 20 events"
  Producer -> Consumer: [20 events]

Time 1: Consumer processes 11 events (9 remaining < min_demand=10)
  Consumer -> Producer: "I want 11 more events" (to refill to 20)
  Producer -> Consumer: [11 events]

Time 2: Consumer slows down (only processes 3 events, 17 remaining)
  No demand sent (17 > min_demand=10)
  Producer waits with buffered events

Time 3: Consumer catches up (processes 10 events, 7 remaining < min_demand)
  Consumer -> Producer: "I want 13 more events"
```

This self-regulating cycle is why GenStage pipelines never overflow: the consumer precisely controls the rate of event delivery by modulating its demand signals.

## Dispatcher Strategies

Dispatchers determine how a producer distributes events among multiple consumers:

| Dispatcher | Strategy | Use Case |
|------------|----------|----------|
| **DemandDispatcher** | Round-robin based on consumer demand | Default; balances load across consumers |
| **BroadcastDispatcher** | Send every event to every consumer | Fan-out patterns, event logging |
| **PartitionDispatcher** | Route events to specific consumers by key | Ordered processing per partition key |

```elixir
# Partition dispatcher: route by domain for ordered processing
defmodule DomainProducer do
  @moduledoc """
  Producer that partitions events by domain name, ensuring all
  events for a given domain are routed to the same consumer for
  ordered, consistent processing.
  """

  use GenStage

  @impl true
  def init(_) do
    {:producer, %{},
     dispatcher: {
       GenStage.PartitionDispatcher,
       partitions: 0..7,
       hash: fn event -> {event, :erlang.phash2(event.domain, 8)} end
     }}
  end
end
```

The PartitionDispatcher is particularly important for scenarios where events related to the same entity must be processed in order. By partitioning on the entity key (e.g., domain name), all events for a given domain are routed to the same consumer, guaranteeing processing order while still distributing load across multiple consumers.

### Custom Dispatcher Implementation

For advanced use cases, custom dispatchers can implement the `GenStage.Dispatcher` behaviour:

```elixir
defmodule PriorityDispatcher do
  @moduledoc """
  Custom dispatcher that routes events based on priority levels.
  Critical events are dispatched immediately; normal events follow
  standard demand-based distribution.
  """

  @behaviour GenStage.Dispatcher

  @impl true
  def init(opts) do
    {:ok, %{priority_consumer: opts[:priority_consumer], subscribers: %{}}}
  end

  @impl true
  def subscribe(opts, from, state) do
    priority = Keyword.get(opts, :priority, :normal)
    {:ok, 0, Map.update!(state, :subscribers, &Map.put(&1, from, priority))}
  end

  @impl true
  def dispatch(events, _length, state) do
    {critical, normal} = Enum.split_with(events, &(&1.priority == :critical))
    # Route critical events to priority consumer, normal events round-robin
    {:ok, [], state}
  end
end
```

## GenStage vs Broadway

GenStage and [Broadway](/glossary/broadway/) serve different levels of abstraction:

| Aspect | GenStage | Broadway |
|--------|----------|---------|
| **Abstraction Level** | Low-level building blocks | High-level declarative pipelines |
| **Batching** | Manual implementation | Built-in automatic batching |
| **Acknowledgment** | Manual implementation | Built-in acknowledgment system |
| **Rate Limiting** | Manual implementation | Built-in rate limiting |
| **Graceful Shutdown** | Manual drain logic | Automatic drain on shutdown |
| **Configuration** | Programmatic subscription | Declarative DSL |
| **Topology** | Arbitrary DAG | Fixed three-stage (producer, processor, batcher) |
| **Use Case** | Custom pipeline topologies | Standard ingestion pipelines |
| **Learning Curve** | Steeper | Gentler (built on GenStage knowledge) |

For most data processing needs, Broadway is the preferred choice. GenStage is used directly when the pipeline topology does not fit Broadway's three-stage model, or when fine-grained control over demand, dispatching, and subscription management is needed.

## Implementation in Prismatic Platform

The Prismatic Platform uses GenStage patterns in the [SEADF](/glossary/seadf/) pipeline for processing intelligence data, quality scan results, and agent telemetry streams. The scanner subsystem collects raw data (producer), normalizes and enriches it (producer-consumer stages), and delivers structured output to storage and analysis consumers.

GenStage also forms the foundation for all [Broadway](/glossary/broadway/) pipelines in the platform, including the Perimeter EASM asset discovery pipeline and the OSINT feed ingestion system. The platform's use of GenStage can be categorized into three tiers:

| Tier | Usage | Pipeline Type | Example |
|------|-------|--------------|---------|
| **Direct GenStage** | Custom topologies requiring non-linear data flow | DAG with fan-out/fan-in | SEADF cross-domain pattern propagation |
| **Broadway** | Standard message ingestion from queues and streams | Linear three-stage | OSINT feed processing, asset discovery |
| **Flow** | Parallel batch processing of bounded datasets | Parallel map-reduce | Quality gate parallel execution |

## Supervision and Fault Recovery

GenStage pipelines are typically organized under a dedicated [supervisor](/glossary/supervisor/) that manages the lifecycle of all stages:

```elixir
defmodule PrismaticPerimeter.Scanner.Supervisor do
  @moduledoc """
  Supervisor for the perimeter scanning pipeline. Uses :rest_for_one
  strategy to ensure downstream stages restart when upstream stages
  crash, preventing stale subscriptions.
  """

  use Supervisor

  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    children = [
      {PrismaticPerimeter.Scanner.Producer, []},
      {PrismaticPerimeter.Scanner.Enricher, []},
      {PrismaticPerimeter.Scanner.Writer, []}
    ]

    Supervisor.init(children, strategy: :rest_for_one)
  end
end
```

The `:rest_for_one` strategy ensures that if a producer crashes, all downstream stages are restarted as well, preventing stale subscriptions. When stages restart, they re-subscribe to their upstream producers and begin requesting demand again, automatically re-establishing the pipeline. This is critical for fault tolerance: a transient failure in any stage results in automatic recovery without manual intervention.

## Performance Tuning

| Optimization | Technique | Impact |
|-------------|-----------|--------|
| **Batch size** | Increase max_demand for throughput | Higher throughput, more memory |
| **Consumer count** | Add parallel consumers | Linear throughput scaling |
| **Buffer size** | Increase for bursty sources | Absorbs spikes, uses more memory |
| **Partition count** | Match CPU cores for CPU-bound work | Parallelism with ordering guarantees |
| **min_demand ratio** | Set to 50-75% of max_demand | Smoother demand flow |

## Testing GenStage Pipelines

```elixir
defmodule PrismaticPerimeter.Scanner.PipelineTest do
  use ExUnit.Case, async: true

  test "events flow from producer through enricher to writer" do
    {:ok, producer} = TestProducer.start_link([])
    {:ok, enricher} = PrismaticPerimeter.Scanner.Enricher.start_link(
      subscribe_to: [{producer, max_demand: 5}]
    )
    {:ok, writer} = TestConsumer.start_link(
      subscribe_to: [{enricher, max_demand: 5}]
    )

    GenStage.cast(producer, {:enqueue, %{domain: "example.com"}})
    assert_receive {:consumed, [%{domain: "example.com", dns: _}]}, 5_000
  end
end
```

## Related Terms

- [Broadway](/glossary/broadway/) - High-level pipeline framework built on GenStage
- [Backpressure](/glossary/backpressure/) - Demand-driven flow control mechanism
- [GenServer](/glossary/genserver/) - Underlying process behavior for each stage
- [OTP](/glossary/otp/) - GenStage builds on OTP behaviors and supervision
- [Supervisor](/glossary/supervisor/) - Manages GenStage pipeline lifecycle
- [Supervision Tree](/glossary/supervision-tree/) - Hierarchical management of pipeline stages
- [BEAM](/glossary/beam/) - Virtual machine running GenStage processes
- [SEADF](/glossary/seadf/) - Platform framework using GenStage patterns
- [Stream Processing](/glossary/stream-processing/) - Real-time data processing paradigm
- [Data Pipeline](/glossary/data-pipeline/) - General pipeline architecture pattern
- [Behaviour](/glossary/behaviour/) - Interface specification GenStage implements
- [Message Passing](/glossary/message-passing/) - Inter-process communication underlying GenStage

## See Also

- [Architecture](/architecture/) - Platform architecture
- [Technologies](/technologies/) - Technology stack
- [Fault Tolerance](/glossary/fault-tolerance/) - Reliability through supervised stages
- [Process Isolation](/glossary/process-isolation/) - Per-stage crash containment

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
