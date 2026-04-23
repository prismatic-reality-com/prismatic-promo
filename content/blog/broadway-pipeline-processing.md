+++
title = "Data Processing Pipelines with Broadway"
date = 2026-03-16
description = "Building robust data processing pipelines using Broadway for batching, rate limiting, backpressure, and acknowledger patterns in due diligence and OSINT workflows."

[extra]
author = "Tomas Korcak (korczis)"
category = "engineering"
tags = ["broadway", "elixir", "data-processing", "pipeline", "backpressure"]
reading_time = "11 min"
keywords = ["broadway elixir", "data pipeline", "backpressure", "batch processing", "rate limiting"]
image = "/images/blog/broadway-pipeline-processing.png"
word_count = 1400
date_created = "2026-03-16"
date_modified = "2026-03-16"
quality_score = 90
see_also = ["broadway", "genstage", "backpressure", "pipeline", "rate-limiting"]
image_alt = "Broadway Pipeline Processing - Prismatic Platform"
+++

When you need to process thousands of items with controlled concurrency, automatic batching, graceful error handling, and backpressure, Broadway is the answer. It builds on GenStage to provide a production-ready pipeline framework that handles the hard parts of concurrent data processing.

This post covers how the Prismatic Platform uses Broadway for DD pipeline processing, OSINT result ingestion, and entity analysis workflows.

## Why Broadway

GenServer-based workers with manual concurrency control get complex fast. You end up reimplementing:

- **Backpressure**: Preventing producers from overwhelming consumers
- **Batching**: Grouping items for efficient bulk operations
- **Rate limiting**: Respecting API quotas and database load
- **Failure handling**: Retries, dead-letter queues, partial batch failures
- **Graceful shutdown**: Draining in-flight work before stopping

Broadway provides all of this out of the box with a declarative configuration.

## Basic Pipeline Structure

A Broadway pipeline has three stages: producers, processors, and batchers.

```elixir
defmodule Prismatic.DD.Pipeline.EntityAnalyzer do
  @moduledoc """
  Broadway pipeline for analyzing DD case entities.
  Processes entities through scoring, enrichment, and storage stages.
  """
  use Broadway

  alias Broadway.Message

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    Broadway.start_link(__MODULE__,
      name: __MODULE__,
      producer: [
        module: {Prismatic.DD.Pipeline.EntityProducer, opts},
        concurrency: 1
      ],
      processors: [
        default: [
          concurrency: 10,
          max_demand: 5
        ]
      ],
      batchers: [
        storage: [
          concurrency: 2,
          batch_size: 50,
          batch_timeout: 1_000
        ],
        notifications: [
          concurrency: 1,
          batch_size: 20,
          batch_timeout: 2_000
        ]
      ]
    )
  end

  @impl true
  def handle_message(:default, %Message{} = message, _context) do
    entity = message.data

    case Prismatic.DD.ScoringEngine.score(entity) do
      {:ok, scored_entity} ->
        message
        |> Message.update_data(fn _ -> scored_entity end)
        |> Message.put_batcher(:storage)

      {:error, reason} ->
        Message.failed(message, reason)
    end
  end

  @impl true
  def handle_batch(:storage, messages, _batch_info, _context) do
    entities = Enum.map(messages, & &1.data)

    case Prismatic.DD.Storage.bulk_upsert(entities) do
      {:ok, _count} ->
        messages

      {:error, reason} ->
        Enum.map(messages, &Message.failed(&1, reason))
    end
  end

  @impl true
  def handle_batch(:notifications, messages, _batch_info, _context) do
    Enum.each(messages, fn msg ->
      Prismatic.Events.DDPipeline.broadcast_entity_scored(msg.data)
    end)

    messages
  end

  @impl true
  def handle_failed(messages, _context) do
    Enum.each(messages, fn msg ->
      Logger.warning("Entity analysis failed",
        entity_id: msg.data.id,
        reason: inspect(msg.status)
      )
    end)

    messages
  end
end
```

## Custom Producer

The producer feeds data into the pipeline. For database-backed queues:

```elixir
defmodule Prismatic.DD.Pipeline.EntityProducer do
  @moduledoc """
  Broadway producer that polls for unprocessed DD entities.
  """
  use GenStage

  @poll_interval_ms 1_000

  @impl true
  def init(opts) do
    case_id = Keyword.fetch!(opts, :case_id)
    schedule_poll()
    {:producer, %{case_id: case_id, demand: 0}}
  end

  @impl true
  def handle_demand(incoming_demand, state) do
    new_demand = state.demand + incoming_demand
    {entities, remaining} = fetch_entities(state.case_id, new_demand)
    {:noreply, entities, %{state | demand: remaining}}
  end

  @impl true
  def handle_info(:poll, state) do
    {entities, remaining} = fetch_entities(state.case_id, state.demand)
    schedule_poll()
    {:noreply, entities, %{state | demand: remaining}}
  end

  defp fetch_entities(case_id, demand) when demand > 0 do
    entities =
      Prismatic.DD.Entity
      |> where([e], e.case_id == ^case_id and e.status == :pending)
      |> limit(^demand)
      |> Prismatic.Repo.all()
      |> Enum.map(&wrap_message/1)

    {entities, demand - length(entities)}
  end

  defp fetch_entities(_case_id, 0), do: {[], 0}

  defp wrap_message(entity) do
    %Broadway.Message{
      data: entity,
      acknowledger: {__MODULE__, :ack_id, entity.id}
    }
  end

  defp schedule_poll do
    Process.send_after(self(), :poll, @poll_interval_ms)
  end
end
```

## Rate Limiting

When processing involves external API calls (OSINT adapters, third-party services), rate limiting is critical. Broadway's concurrency settings provide coarse control, but for precise rate limiting use a token bucket:

```elixir
defmodule Prismatic.RateLimiter do
  @moduledoc """
  Token bucket rate limiter for external API calls.
  """
  use GenServer

  defmodule State do
    @moduledoc false
    defstruct [:max_tokens, :refill_rate_ms, :tokens, :last_refill]
  end

  @spec acquire(GenServer.server()) :: :ok | {:error, :rate_limited}
  def acquire(server) do
    GenServer.call(server, :acquire)
  end

  @impl true
  def init(opts) do
    state = %State{
      max_tokens: Keyword.get(opts, :max_per_second, 10),
      refill_rate_ms: div(1_000, Keyword.get(opts, :max_per_second, 10)),
      tokens: Keyword.get(opts, :max_per_second, 10),
      last_refill: System.monotonic_time(:millisecond)
    }

    {:ok, state}
  end

  @impl true
  def handle_call(:acquire, _from, state) do
    state = refill_tokens(state)

    if state.tokens > 0 do
      {:reply, :ok, %{state | tokens: state.tokens - 1}}
    else
      {:reply, {:error, :rate_limited}, state}
    end
  end

  defp refill_tokens(state) do
    now = System.monotonic_time(:millisecond)
    elapsed = now - state.last_refill
    new_tokens = div(elapsed, state.refill_rate_ms)

    if new_tokens > 0 do
      %{state |
        tokens: min(state.tokens + new_tokens, state.max_tokens),
        last_refill: now
      }
    else
      state
    end
  end
end
```

Integrate with Broadway by calling the rate limiter in `handle_message/3`:

```elixir
@impl true
def handle_message(:default, message, _context) do
  case Prismatic.RateLimiter.acquire(ShodanLimiter) do
    :ok ->
      process_message(message)

    {:error, :rate_limited} ->
      Process.sleep(100)
      handle_message(:default, message, nil)
  end
end
```

## Batch Processing Patterns

The key insight with batchers is that they accumulate messages and flush either when `batch_size` is reached or `batch_timeout` expires, whichever comes first:

| Setting | Value | Effect |
|---|---|---|
| `batch_size: 50` | Max items per batch | Flush when 50 items accumulated |
| `batch_timeout: 1_000` | Max wait in ms | Flush after 1 second even if < 50 items |
| `concurrency: 2` | Parallel batch handlers | 2 batches processed simultaneously |

For database writes, larger batches are more efficient. For notifications, smaller batches with shorter timeouts provide lower latency.

## Error Handling and Dead Letters

Failed messages in Broadway can be routed to a dead-letter handler:

```elixir
@impl true
def handle_failed(messages, _context) do
  Enum.each(messages, fn message ->
    :telemetry.execute(
      [:prismatic, :dd, :pipeline, :failed],
      %{count: 1},
      %{
        entity_id: message.data.id,
        reason: inspect(message.status)
      }
    )

    Prismatic.DD.Pipeline.DeadLetter.store(%{
      entity_id: message.data.id,
      payload: message.data,
      error: message.status,
      failed_at: DateTime.utc_now(),
      retry_count: 0
    })
  end)

  messages
end
```

A separate process can periodically retry dead-lettered items with exponential backoff.

## Monitoring and Telemetry

Broadway emits telemetry events for every stage. Attach handlers for dashboards:

```elixir
:telemetry.attach_many("broadway-metrics", [
  [:broadway, :processor, :start],
  [:broadway, :processor, :stop],
  [:broadway, :processor, :message, :exception],
  [:broadway, :batcher, :start],
  [:broadway, :batcher, :stop],
  [:broadway, :batch_processor, :start],
  [:broadway, :batch_processor, :stop]
], &PipelineMetrics.handle/4, nil)
```

Key metrics to track:

- **Throughput**: Messages processed per second per processor
- **Batch fill rate**: Average batch size vs configured max
- **Failure rate**: Failed messages as percentage of total
- **Processing latency**: Time from message creation to batch completion
- **Queue depth**: Demand vs available items in the producer

## Graceful Shutdown

Broadway handles graceful shutdown automatically. When the application stops:

1. The producer stops generating new messages
2. In-flight messages complete processing
3. Pending batches flush
4. Handlers receive final batches

Configure the drain timeout in your application supervisor:

```elixir
children = [
  {Prismatic.DD.Pipeline.EntityAnalyzer, case_id: "default"}
]

Supervisor.init(children,
  strategy: :one_for_one,
  shutdown: :timer.seconds(30)
)
```

This gives the pipeline 30 seconds to drain before forced termination.

## Summary

Broadway eliminates the boilerplate of concurrent data processing. Define your producer, write your processing logic in `handle_message/3`, configure batchers for bulk operations, and let the framework handle concurrency, backpressure, and failure management. Combined with telemetry and rate limiting, it provides a production-grade pipeline with minimal code.
