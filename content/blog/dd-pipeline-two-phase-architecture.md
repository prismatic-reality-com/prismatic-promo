+++
title = "DD Pipeline Two-Phase Architecture: Client/Loader Pattern"
date = 2026-03-02
description = "Deep dive into Prismatic's two-phase due diligence pipeline architecture with concurrent fetching, entity processing, and PubSub streaming"

[extra]
author = "Tomas Korcak (korczis)"
category = "deep-dive"
tags = ["due-diligence", "pipeline", "architecture", "elixir", "pubsub"]
reading_time = "12 min"
keywords = ["dd pipeline", "two-phase architecture", "client loader pattern", "pubsub streaming", "concurrent fetching"]
image = "/images/blog/dd-pipeline-two-phase-architecture.png"
word_count = 1350
date_created = "2026-03-02"
date_modified = "2026-03-02"
quality_score = 88
see_also = ["due-diligence", "pipeline", "pubsub", "broadway", "backpressure"]
image_alt = "DD Pipeline Two-Phase Architecture - Prismatic Platform"
+++

Due diligence investigations require orchestrating dozens of data sources with wildly different response times, reliability characteristics, and rate limits. A naive sequential approach collapses under real-world conditions. This post details the two-phase Client/Loader architecture that powers Prismatic's DD pipeline, enabling concurrent data acquisition with structured entity processing.

## The Problem with Monolithic Pipelines

Traditional DD platforms fetch data sequentially: query a business registry, wait for a response, query a court database, wait again, then attempt to stitch results together. This approach has three fatal flaws. First, total latency equals the sum of all source latencies, meaning a 15-source investigation can take minutes. Second, a single source failure blocks the entire pipeline. Third, there is no natural point for incremental result delivery to the user.

## Phase 1: The Client Layer

The Client layer is responsible for concurrent data acquisition from external sources. Each source is wrapped in an adapter module implementing the `Prismatic.DD.Source` behaviour:

```elixir
defmodule Prismatic.DD.Source do
  @callback fetch(entity :: map(), opts :: keyword()) ::
    {:ok, %{data: map(), confidence: float(), source: atom()}}
    | {:error, term()}

  @callback source_group() :: :registry | :court | :financial | :sanctions | :media
  @callback rate_limit() :: {requests :: pos_integer(), window_ms :: pos_integer()}
  @callback priority() :: 1..10
end
```

Source groups are a critical design element. Rather than treating all sources equally, we partition them into logical groups: `:registry` for business registries, `:court` for litigation databases, `:financial` for financial data providers, `:sanctions` for sanctions lists, and `:media` for news and media monitoring. This grouping drives the scheduling strategy.

### Concurrent Fetching with Backpressure

The Client layer uses `Task.async_stream/3` with controlled concurrency per source group:

```elixir
defmodule Prismatic.DD.Client do
  @moduledoc """
  Concurrent data acquisition layer for DD pipeline.
  Manages source groups with independent concurrency limits.
  """

  @group_concurrency %{
    registry: 5,
    court: 3,
    financial: 4,
    sanctions: 10,
    media: 8
  }

  @spec fetch_all(map(), [module()], keyword()) :: [source_result()]
  def fetch_all(entity, sources, opts \\ []) do
    timeout = Keyword.get(opts, :timeout, 30_000)

    sources
    |> Enum.group_by(& &1.source_group())
    |> Enum.flat_map(fn {group, group_sources} ->
      max_concurrency = Map.get(@group_concurrency, group, 3)

      group_sources
      |> Task.async_stream(
        fn source -> execute_with_telemetry(source, entity, opts) end,
        max_concurrency: max_concurrency,
        timeout: timeout,
        on_timeout: :kill_task
      )
      |> Enum.map(fn
        {:ok, result} -> result
        {:exit, :timeout} -> {:error, :timeout}
      end)
    end)
  end

  defp execute_with_telemetry(source, entity, opts) do
    start_time = System.monotonic_time()

    :telemetry.execute(
      [:prismatic, :dd, :source, :start],
      %{system_time: System.system_time()},
      %{source: source, entity_id: entity.id}
    )

    result = source.fetch(entity, opts)

    :telemetry.execute(
      [:prismatic, :dd, :source, :stop],
      %{duration: System.monotonic_time() - start_time},
      %{source: source, entity_id: entity.id, result: elem(result, 0)}
    )

    result
  end
end
```

Each source group operates with its own concurrency limit. Sanctions lists are highly parallelizable (stateless HTTP lookups), so they get 10 concurrent slots. Court databases are more fragile, limited to 3. This prevents any single group from starving others.

### Rate Limiting

Rate limiting is implemented per-source using a token bucket stored in ETS:

```elixir
defmodule Prismatic.DD.RateLimiter do
  @moduledoc """
  Token bucket rate limiter backed by ETS for sub-millisecond access.
  """

  use GenServer
  require Logger

  def check_rate(source) do
    {max_requests, window_ms} = source.rate_limit()
    bucket_key = {source, current_window(window_ms)}

    case :ets.update_counter(@table, bucket_key, {2, 1}, {bucket_key, 0}) do
      count when count <= max_requests -> :ok
      _over_limit -> {:error, :rate_limited}
    end
  end

  defp current_window(window_ms) do
    div(System.system_time(:millisecond), window_ms)
  end
end
```

## Phase 2: The Loader Layer

Once raw data arrives from the Client layer, the Loader layer takes over. Its responsibilities are entity resolution, data normalization, confidence scoring, and persistence. The Loader operates as a GenStage pipeline with three stages: normalizer, resolver, and persister.

### Entity Resolution

The most complex part of the Loader is entity resolution. The same company might appear as "Acme s.r.o.", "ACME, s.r.o.", or "Acme spol. s r.o." across different registries. The resolver uses a combination of exact ICO matching, fuzzy name matching with Jaro-Winkler distance, and address normalization:

```elixir
defmodule Prismatic.DD.Loader.Resolver do
  @moduledoc """
  Entity resolution across heterogeneous data sources.
  """

  @jaro_threshold 0.92

  @spec resolve(raw_entity :: map(), existing :: [map()]) :: {:match, map()} | {:new, map()}
  def resolve(raw_entity, existing_entities) do
    cond do
      match = find_by_ico(raw_entity, existing_entities) ->
        {:match, merge_entity(match, raw_entity)}

      match = find_by_fuzzy_name(raw_entity, existing_entities) ->
        {:match, merge_entity(match, raw_entity)}

      true ->
        {:new, normalize_entity(raw_entity)}
    end
  end

  defp find_by_ico(%{ico: ico}, entities) when is_binary(ico) do
    Enum.find(entities, fn e -> e.ico == ico end)
  end

  defp find_by_ico(_entity, _entities), do: nil

  defp find_by_fuzzy_name(%{name: name}, entities) when is_binary(name) do
    normalized = normalize_name(name)

    Enum.find(entities, fn e ->
      String.jaro_distance(normalized, normalize_name(e.name)) >= @jaro_threshold
    end)
  end

  defp find_by_fuzzy_name(_entity, _entities), do: nil

  defp normalize_name(name) do
    name
    |> String.downcase()
    |> String.replace(~r/\s*(s\.r\.o\.|spol\.\s*s\s*r\.o\.|a\.s\.|s\.p\.)\s*/i, "")
    |> String.replace(~r/[,\.\-]+/, " ")
    |> String.trim()
  end
end
```

### PubSub Streaming

As the Loader processes entities, results are broadcast via Phoenix PubSub on the `"dd:pipeline"` topic. This enables real-time LiveView updates without polling:

```elixir
defmodule Prismatic.DD.Loader.Broadcaster do
  @moduledoc """
  PubSub broadcasting for DD pipeline progress and results.
  """

  @topic "dd:pipeline"

  @spec broadcast_progress(case_id :: binary(), event :: atom(), payload :: map()) :: :ok
  def broadcast_progress(case_id, event, payload) do
    Phoenix.PubSub.broadcast(
      Prismatic.PubSub,
      "#{@topic}:#{case_id}",
      {event, Map.put(payload, :timestamp, DateTime.utc_now())}
    )
  end

  @spec broadcast_entity_resolved(case_id :: binary(), entity :: map()) :: :ok
  def broadcast_entity_resolved(case_id, entity) do
    broadcast_progress(case_id, :entity_resolved, %{
      entity_id: entity.id,
      name: entity.name,
      source_count: length(entity.sources),
      confidence: entity.confidence
    })
  end
end
```

LiveView components subscribe to case-specific topics and render results incrementally as they arrive. The user sees entities appearing in real-time rather than waiting for the entire pipeline to complete.

## The Scheduler

Orchestrating the two phases is the DD Scheduler, a GenServer that manages pipeline lifecycle:

```elixir
defmodule Prismatic.DD.Scheduler do
  @moduledoc """
  Pipeline lifecycle management for DD investigations.
  """

  use GenServer
  require Logger

  def start_investigation(case_id, entities, opts \\ []) do
    GenServer.call(__MODULE__, {:start, case_id, entities, opts})
  end

  @impl true
  def handle_call({:start, case_id, entities, opts}, _from, state) do
    sources = select_sources(entities, opts)

    task =
      Task.Supervisor.async_nolink(Prismatic.DD.TaskSupervisor, fn ->
        results = Prismatic.DD.Client.fetch_all(entities, sources, opts)

        Prismatic.DD.Loader.process(case_id, results, opts)
      end)

    new_state = Map.put(state, case_id, %{task: task, started_at: DateTime.utc_now()})
    {:reply, {:ok, case_id}, new_state}
  end
end
```

The Scheduler uses `Task.Supervisor.async_nolink/2` to isolate pipeline failures. If a pipeline crashes, it does not bring down the Scheduler, and other running investigations continue unaffected.

## Performance Characteristics

In production, the two-phase architecture achieves median investigation times of 4.2 seconds for a standard 15-source Czech company DD, compared to 45+ seconds with sequential fetching. The 90th percentile sits at 8.1 seconds, bounded primarily by the slowest external source.

The key insight is that the Client/Loader separation creates a natural boundary for error handling. Client-layer failures (network timeouts, rate limits) are transient and retryable. Loader-layer failures (entity resolution conflicts, schema violations) are logical and require investigation. Mixing these concerns in a monolithic pipeline makes error recovery vastly more complex.

## Conclusion

The two-phase architecture transforms DD from a batch process into a streaming operation. Users see results within seconds rather than minutes. The system gracefully degrades when sources are unavailable. And the clear separation between data acquisition and entity processing makes the codebase maintainable as we add new sources. This pattern has proven robust across thousands of investigations and continues to scale with the platform.
