+++
title = "Mycelial Network Architecture: Bio-Inspired System Design"
date = 2026-03-18
description = "Bio-inspired mycelial network topology for cross-domain signal propagation, nutrient routing, pattern extraction, and adaptive load distribution in a distributed platform."

[extra]
author = "Tomas Korcak (korczis)"
category = "evolution"
tags = ["mycelial", "bio-inspired", "architecture", "distributed-systems", "signal-propagation"]
reading_time = "9 min"
keywords = ["mycelial network", "bio-inspired architecture", "signal propagation", "nutrient routing", "pattern extraction"]
image = "/images/blog/mycelial-network-architecture.png"
word_count = 1100
date_created = "2026-03-18"
date_modified = "2026-03-18"
quality_score = 85
see_also = ["architecture", "developers"]
image_alt = "Mycelial Network Architecture: Bio-Inspired System Design - Prismatic Platform"
+++

Mycelial networks in nature solve a hard problem: distributing nutrients and signals across vast, decentralized organisms with no central coordinator. The Prismatic Platform borrows this metaphor for cross-domain coordination. When an OSINT discovery affects a DD case, when a security scan reveals a risk that impacts an investigation, or when a pattern in one domain matches anomalies in another, the mycelial network propagates these signals to the right consumers.

## The Biological Metaphor

In forest ecosystems, mycorrhizal networks connect trees through underground fungal filaments. Trees share nutrients, warn each other of threats, and allocate resources to where they are needed most. The platform's mycelial network mirrors these properties:

| Biological Concept | Platform Analog | Implementation |
|-------------------|-----------------|----------------|
| Hyphae (filaments) | PubSub channels | Phoenix.PubSub topics |
| Nutrient transfer | Data propagation | Structured signal messages |
| Chemical signals | Domain events | Event structs with metadata |
| Mycelium nodes | Domain routers | GenServer signal processors |
| Nutrient allocation | Load distribution | Demand-based routing |
| Threat warnings | Alert propagation | Priority signal escalation |

## Network Topology

The mycelial network is organized in three layers: the substrate layer (raw PubSub), the routing layer (domain-scoped signal processors), and the intelligence layer (pattern extraction and correlation):

```elixir
defmodule PrismaticMycelium.Network do
  @moduledoc """
  Core mycelial network coordinator.

  Manages the three-layer signal propagation topology:
  substrate (PubSub), routing (domain processors),
  and intelligence (pattern extraction).
  """

  use GenServer
  require Logger

  @type signal :: %{
    id: String.t(),
    source_domain: atom(),
    target_domains: [atom()] | :broadcast,
    type: atom(),
    payload: map(),
    priority: :low | :normal | :high | :critical,
    timestamp: DateTime.t(),
    ttl: non_neg_integer()
  }

  @domains ~w(osint dd security investigation perimeter academy)a

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec propagate(signal()) :: :ok
  def propagate(signal) do
    GenServer.cast(__MODULE__, {:propagate, signal})
  end

  @spec subscribe(atom()) :: :ok
  def subscribe(domain) when domain in @domains do
    Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "mycelium:#{domain}")
  end

  @impl GenServer
  def init(_opts) do
    state = %{
      signal_count: 0,
      domain_stats: Map.new(@domains, fn d -> {d, %{sent: 0, received: 0}} end),
      active_patterns: []
    }

    {:ok, state}
  end

  @impl GenServer
  def handle_cast({:propagate, signal}, state) do
    targets = resolve_targets(signal)
    enriched = enrich_signal(signal, state)

    for domain <- targets do
      Phoenix.PubSub.broadcast(
        PrismaticWeb.PubSub,
        "mycelium:#{domain}",
        {:mycelial_signal, enriched}
      )
    end

    new_state = update_stats(state, signal.source_domain, targets)
    {:noreply, new_state}
  end

  defp resolve_targets(%{target_domains: :broadcast}), do: @domains
  defp resolve_targets(%{target_domains: targets}), do: targets

  defp enrich_signal(signal, state) do
    Map.merge(signal, %{
      hop_count: 0,
      network_load: state.signal_count,
      propagation_id: generate_propagation_id()
    })
  end

  defp generate_propagation_id do
    Base.encode16(:crypto.strong_rand_bytes(8), case: :lower)
  end
end
```

## Domain-Scoped Signal Processing

Each domain has a signal processor that filters, transforms, and acts on incoming mycelial signals. The processor implements domain-specific logic for how signals are consumed:

```elixir
defmodule PrismaticMycelium.Processors.DDProcessor do
  @moduledoc """
  DD domain signal processor.

  Processes mycelial signals relevant to due diligence:
  entity risk changes from OSINT, security findings,
  investigation updates, and perimeter alerts.
  """

  use GenServer
  require Logger

  alias PrismaticMycelium.Network

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenServer
  def init(_opts) do
    Network.subscribe(:dd)
    {:ok, %{processed: 0, actions_taken: 0}}
  end

  @impl GenServer
  def handle_info({:mycelial_signal, signal}, state) do
    case process_signal(signal) do
      {:action, action} ->
        execute_action(action)
        {:noreply, %{state | processed: state.processed + 1, actions_taken: state.actions_taken + 1}}

      :ignored ->
        {:noreply, %{state | processed: state.processed + 1}}
    end
  end

  defp process_signal(%{type: :entity_risk_change, payload: payload}) do
    case PrismaticDD.Cases.find_by_entity(payload.entity_id) do
      [] -> :ignored
      cases ->
        {:action, %{
          type: :update_case_risk,
          cases: cases,
          new_risk: payload.new_risk_score,
          source: payload.source
        }}
    end
  end

  defp process_signal(%{type: :security_finding, priority: priority})
       when priority in [:high, :critical] do
    {:action, %{type: :escalate_to_analyst, priority: priority}}
  end

  defp process_signal(_signal), do: :ignored

  defp execute_action(%{type: :update_case_risk} = action) do
    for dd_case <- action.cases do
      PrismaticDD.Cases.update_risk_from_signal(dd_case, action.new_risk, action.source)
      Logger.info("DD case #{dd_case.id} risk updated via mycelial signal")
    end
  end
end
```

## Nutrient Routing

The nutrient routing system implements demand-based resource allocation. Domains that need more processing capacity signal their demand, and the network redistributes resources:

```elixir
defmodule PrismaticMycelium.NutrientRouter do
  @moduledoc """
  Demand-based resource allocation across domains.

  Monitors domain processing queues and redistributes
  worker capacity based on real-time demand signals.
  Implements exponential decay for demand smoothing.
  """

  use GenServer
  require Logger

  @check_interval :timer.seconds(10)
  @decay_factor 0.9

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenServer
  def init(_opts) do
    schedule_check()
    {:ok, %{demand: %{}, allocations: %{}, history: []}}
  end

  @impl GenServer
  def handle_info(:check_demand, state) do
    current_demand = measure_demand()
    smoothed = smooth_demand(state.demand, current_demand)
    new_allocations = compute_allocations(smoothed)

    apply_allocations(new_allocations, state.allocations)

    schedule_check()
    {:noreply, %{state | demand: smoothed, allocations: new_allocations}}
  end

  defp measure_demand do
    for domain <- PrismaticMycelium.Network.domains(), into: %{} do
      queue_depth = PrismaticMycelium.Processors.queue_depth(domain)
      processing_rate = PrismaticMycelium.Processors.processing_rate(domain)
      {domain, %{queue: queue_depth, rate: processing_rate}}
    end
  end

  defp smooth_demand(previous, current) do
    Map.merge(current, previous, fn _key, curr, prev ->
      %{
        queue: curr.queue * (1 - @decay_factor) + prev.queue * @decay_factor,
        rate: curr.rate * (1 - @decay_factor) + prev.rate * @decay_factor
      }
    end)
  end

  defp compute_allocations(demand) do
    total_demand = demand |> Map.values() |> Enum.map(& &1.queue) |> Enum.sum()

    if total_demand == 0 do
      Map.new(demand, fn {domain, _} -> {domain, 1.0 / map_size(demand)} end)
    else
      Map.new(demand, fn {domain, %{queue: q}} -> {domain, q / total_demand} end)
    end
  end

  defp schedule_check, do: Process.send_after(self(), :check_demand, @check_interval)
end
```

## Pattern Extraction

The intelligence layer detects recurring signal patterns across the network. When the same type of signal appears from multiple domains within a time window, it may indicate a systemic issue or a cross-domain correlation:

```elixir
defmodule PrismaticMycelium.PatternExtractor do
  @moduledoc """
  Detects recurring patterns in mycelial signal flows.

  Uses sliding time windows to identify signal clusters,
  cross-domain correlations, and anomalous propagation
  patterns that may indicate systemic issues.
  """

  use GenServer
  require Logger

  @window_size :timer.minutes(5)
  @min_cluster_size 3

  @type pattern :: %{
    id: String.t(),
    signal_type: atom(),
    domains: [atom()],
    frequency: non_neg_integer(),
    first_seen: DateTime.t(),
    last_seen: DateTime.t(),
    confidence: float()
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec detected_patterns() :: [pattern()]
  def detected_patterns do
    GenServer.call(__MODULE__, :get_patterns)
  end

  @impl GenServer
  def init(_opts) do
    for domain <- PrismaticMycelium.Network.domains() do
      PrismaticMycelium.Network.subscribe(domain)
    end

    schedule_analysis()
    {:ok, %{signals: [], patterns: []}}
  end

  @impl GenServer
  def handle_info({:mycelial_signal, signal}, state) do
    entry = %{
      type: signal.type,
      source: signal.source_domain,
      timestamp: signal.timestamp,
      payload_hash: :erlang.phash2(signal.payload)
    }

    pruned = prune_window(state.signals ++ [entry])
    {:noreply, %{state | signals: pruned}}
  end

  @impl GenServer
  def handle_info(:analyze, state) do
    patterns = extract_patterns(state.signals)

    for pattern <- patterns, pattern.confidence > 0.7 do
      Logger.info("Mycelial pattern detected: #{pattern.signal_type} across #{inspect(pattern.domains)}")
    end

    schedule_analysis()
    {:noreply, %{state | patterns: patterns}}
  end

  defp extract_patterns(signals) do
    signals
    |> Enum.group_by(& &1.type)
    |> Enum.filter(fn {_type, group} -> length(group) >= @min_cluster_size end)
    |> Enum.map(fn {type, group} ->
      domains = group |> Enum.map(& &1.source) |> Enum.uniq()
      %{
        id: Base.encode16(:crypto.strong_rand_bytes(4), case: :lower),
        signal_type: type,
        domains: domains,
        frequency: length(group),
        first_seen: group |> Enum.map(& &1.timestamp) |> Enum.min(DateTime),
        last_seen: group |> Enum.map(& &1.timestamp) |> Enum.max(DateTime),
        confidence: length(domains) / length(PrismaticMycelium.Network.domains())
      }
    end)
  end

  defp prune_window(signals) do
    cutoff = DateTime.add(DateTime.utc_now(), -@window_size, :millisecond)
    Enum.filter(signals, fn s -> DateTime.compare(s.timestamp, cutoff) == :gt end)
  end

  defp schedule_analysis, do: Process.send_after(self(), :analyze, :timer.seconds(30))
end
```

| Metric | Value | Description |
|--------|-------|-------------|
| Signal latency | < 5ms | Time from propagate/1 to processor receipt |
| Pattern detection window | 5 minutes | Sliding window for cluster analysis |
| Min cluster size | 3 signals | Minimum signals to form a pattern |
| Confidence threshold | 0.7 | Min cross-domain ratio for alert |
| Demand check interval | 10 seconds | Nutrient routing rebalance frequency |

The mycelial network provides a coordination layer that would be difficult to achieve with direct module-to-module dependencies. Domains remain loosely coupled while still responding to events across the platform. The biological metaphor guides design decisions toward resilient, self-organizing patterns that scale naturally with platform growth.
