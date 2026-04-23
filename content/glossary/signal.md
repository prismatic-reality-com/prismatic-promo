+++
title = "Signal"
weight = 50
[extra]
description = "NABLA epistemic evidence unit representing a discrete piece of information with provenance, confidence, and temporal metadata"
category = "epistemics"
related_terms = ["nabla-infinity", "trinity-gate", "addiction-preservation", "contradiction-preservation", "signal-plurality", "confidence"]
complexity_level = "advanced"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["signal", "NABLA", "epistemic", "evidence", "intelligence", "glossary", "Prismatic Platform"]
tags = ["glossary", "epistemics", "intelligence"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Signal - Prismatic Platform"
+++

## Definition & Overview

In the NABLA Infinity epistemic framework, a signal is the atomic unit of evidence -- a discrete piece of information carrying provenance metadata, a confidence score, a timestamp, and an explicit source attribution. Signals are the raw inputs from which beliefs are constructed, tested, and either strengthened or discarded. Unlike traditional data points that exist in isolation, signals are first-class citizens in a formal reasoning system that demands plurality, contradiction preservation, and traceable provenance for every claim.

The signal concept is fundamental to the Prismatic Platform's approach to intelligence analysis. In OSINT operations, each piece of information from each source constitutes a separate signal. A domain WHOIS lookup produces one signal, a DNS resolution produces another, a certificate transparency log produces a third. These signals may agree, contradict, or provide orthogonal perspectives. The platform's epistemic framework treats all three cases as equally valuable: agreement strengthens confidence, contradiction triggers deeper investigation, and orthogonality expands coverage.

The NABLA framework's Signal Plurality axiom requires a minimum of two independent signals before any belief can be established. This prevents single-source dependency, one of the most common intelligence analysis failures. When the platform encounters a claim backed by only one signal, it explicitly marks that claim as "unconfirmed" rather than silently treating it as fact. This principled uncertainty tracking is what distinguishes an epistemic system from a simple data aggregator.

## Technical Deep Dive

### Signal Data Structure

Signals in the Prismatic Platform carry rich metadata beyond the raw observation value:

```elixir
defmodule PrismaticNabla.Signal do
  @moduledoc """
  Atomic evidence unit in the NABLA epistemic framework.
  Every signal is immutable once created -- observations cannot be modified.
  """

  @type t :: %__MODULE__{
    id: String.t(),
    source: source_info(),
    observation: term(),
    confidence: float(),
    timestamp: DateTime.t(),
    provenance: provenance(),
    domain: atom(),
    tags: [atom()],
    decay_rate: float(),
    contradicts: [String.t()],
    corroborates: [String.t()]
  }

  @type source_info :: %{
    adapter: module(),
    query: String.t(),
    source_type: :primary | :secondary | :derived,
    independence_group: atom()
  }

  @type provenance :: %{
    pipeline: String.t(),
    tool_slug: String.t(),
    raw_response_hash: String.t(),
    transformation_chain: [atom()]
  }

  @enforce_keys [:id, :source, :observation, :confidence, :timestamp, :provenance, :domain]
  defstruct [
    :id,
    :source,
    :observation,
    :confidence,
    :timestamp,
    :provenance,
    :domain,
    tags: [],
    decay_rate: 0.01,
    contradicts: [],
    corroborates: []
  ]

  @spec new(map()) :: {:ok, t()} | {:error, term()}
  def new(attrs) do
    signal = struct!(__MODULE__, Map.merge(attrs, %{
      id: generate_id(),
      timestamp: DateTime.utc_now()
    }))
    validate(signal)
  end

  @spec decayed_confidence(t()) :: float()
  def decayed_confidence(%__MODULE__{} = signal) do
    age_hours = DateTime.diff(DateTime.utc_now(), signal.timestamp, :hour)
    signal.confidence * :math.exp(-signal.decay_rate * age_hours)
  end

  defp generate_id do
    Base.encode16(:crypto.strong_rand_bytes(16), case: :lower)
  end

  defp validate(%__MODULE__{confidence: c}) when c < 0.0 or c > 1.0 do
    {:error, :invalid_confidence}
  end

  defp validate(%__MODULE__{} = signal), do: {:ok, signal}
end
```

### Signal Aggregation

Multiple signals are aggregated into beliefs through formal combination rules that respect the NABLA axioms:

```elixir
defmodule PrismaticNabla.SignalAggregator do
  @moduledoc """
  Combines multiple signals into beliefs while enforcing
  NABLA axioms: signal plurality, contradiction preservation,
  source independence weighting.
  """

  alias PrismaticNabla.Signal

  @spec aggregate([Signal.t()]) :: {:ok, belief()} | {:error, term()}
  def aggregate([]) do
    {:error, :no_signals}
  end

  def aggregate([_single]) do
    {:error, :insufficient_plurality}
  end

  def aggregate(signals) when length(signals) >= 2 do
    grouped = group_by_independence(signals)
    independent_count = map_size(grouped)

    if independent_count < 2 do
      {:error, :insufficient_independent_sources}
    else
      contradictions = find_contradictions(signals)
      confidence = calculate_aggregate_confidence(signals, independent_count)

      belief = %{
        signals: signals,
        signal_count: length(signals),
        independent_sources: independent_count,
        confidence: confidence,
        contradictions: contradictions,
        status: if(Enum.empty?(contradictions), do: :consistent, else: :contradicted),
        timestamp: DateTime.utc_now()
      }

      {:ok, belief}
    end
  end

  defp group_by_independence(signals) do
    Enum.group_by(signals, & &1.source.independence_group)
  end

  defp find_contradictions(signals) do
    signals
    |> Enum.flat_map(fn s -> Enum.map(s.contradicts, &{s.id, &1}) end)
    |> Enum.uniq()
  end

  defp calculate_aggregate_confidence(signals, independent_count) do
    weighted_sum =
      signals
      |> Enum.map(&Signal.decayed_confidence/1)
      |> Enum.sum()

    base = weighted_sum / length(signals)
    independence_bonus = min(0.15, (independent_count - 1) * 0.05)
    min(1.0, base + independence_bonus)
  end
end
```

### Signal Collection from OSINT Tools

The platform's 127 OSINT tools each produce signals from their respective data sources:

```elixir
defmodule PrismaticOsintCore.SignalCollector do
  @moduledoc """
  Transforms raw OSINT tool results into NABLA signals
  with proper provenance and source metadata.
  """

  alias PrismaticNabla.Signal

  @spec collect_from_tool(module(), map(), map()) :: {:ok, [Signal.t()]} | {:error, term()}
  def collect_from_tool(tool_module, params, raw_result) do
    tool_config = tool_module.__tool_config__()

    signals =
      raw_result
      |> extract_observations(tool_config)
      |> Enum.map(fn observation ->
        Signal.new(%{
          source: %{
            adapter: tool_module,
            query: inspect(params),
            source_type: classify_source(tool_config),
            independence_group: tool_config.category
          },
          observation: observation,
          confidence: base_confidence(tool_config),
          domain: tool_config.category,
          provenance: %{
            pipeline: "osint_toolbox",
            tool_slug: tool_config.slug,
            raw_response_hash: hash_response(raw_result),
            transformation_chain: [:raw, :extracted, :normalized]
          },
          tags: tool_config.tags || []
        })
      end)
      |> Enum.filter(&match?({:ok, _}, &1))
      |> Enum.map(fn {:ok, signal} -> signal end)

    {:ok, signals}
  end

  defp classify_source(%{api_style: :provider}), do: :primary
  defp classify_source(%{api_style: :source}), do: :primary
  defp classify_source(_), do: :secondary

  defp base_confidence(%{requires_auth: true}), do: 0.85
  defp base_confidence(_), do: 0.70

  defp hash_response(result) do
    :crypto.hash(:sha256, :erlang.term_to_binary(result))
    |> Base.encode16(case: :lower)
    |> binary_part(0, 16)
  end
end
```

## Architecture & Implementation

The signal architecture follows a pipeline model: collection, normalization, aggregation, and belief formation. Each stage is implemented as a separate module with well-defined interfaces, allowing signals to flow through the system without tight coupling between components.

Signal storage uses a dual strategy. Hot signals (recent, high-confidence) are kept in ETS for sub-microsecond access during active investigations. All signals are persisted to PostgreSQL with JSONB attributes for audit trails and historical analysis. This mirrors the platform's general dual-storage pattern used across registries and caches.

Time decay is a critical signal property. A DNS resolution from five minutes ago carries more weight than one from five days ago. The `decayed_confidence/1` function applies exponential decay based on each signal's configured decay rate, ensuring that stale evidence naturally loses influence over belief formation without manual intervention.

## Usage in Prismatic Platform

Signals flow through every intelligence subsystem. The OSINT toolbox generates signals from tool executions. The DD pipeline transforms entity data into signals for compliance analysis. The Perimeter module converts vulnerability findings into signals that feed security scoring. The color-team security operations use signals to represent both attack evidence (Red Team) and defensive observations (Blue Team), with Purple Team responsible for signal synthesis.

The Blue Team's signal aggregator specifically implements the NABLA plurality requirement, refusing to form beliefs from single-source evidence. This disciplined approach prevents the false certainty that plagues many intelligence analysis systems.

## Cross-References

- [NABLA Infinity](/glossary/nabla-infinity/) - Epistemic framework governing signal handling
- [Trinity Gate](/glossary/trinity-gate/) - Three-layer validation that signals must pass
- **Addiction Preservation** - Doctrine requiring contradiction preservation in signals
- **Confidence** - Numerical measure of signal reliability
- [OSINT](/glossary/osint/) - Intelligence discipline producing signals from open sources

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
