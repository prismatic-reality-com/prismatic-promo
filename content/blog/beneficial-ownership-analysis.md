+++
title = "Beneficial Ownership Analysis: Tracing Ultimate Controllers"
date = 2026-03-06
description = "How Prismatic traces ultimate beneficial owners through complex ownership chains, nominee structures, and offshore entities using Czech and EU registries"

[extra]
author = "Tomas Korcak (korczis)"
category = "intelligence"
tags = ["ubo", "beneficial-ownership", "investigation", "compliance", "czech-registry"]
reading_time = "12 min"
keywords = ["beneficial ownership", "UBO investigation", "ownership chains", "nominee detection", "offshore structures"]
image = "/images/blog/beneficial-ownership-analysis.png"
word_count = 1320
date_created = "2026-03-06"
date_modified = "2026-03-06"
quality_score = 86
see_also = ["due-diligence", "entity-resolution", "knowledge-graph", "kyc", "compliance"]
image_alt = "Beneficial Ownership Analysis - Prismatic Platform"
+++

Identifying the true controllers behind a corporate entity is one of the most critical and challenging aspects of due diligence. Legal ownership and beneficial ownership frequently diverge, sometimes innocently through holding structures, sometimes deliberately through nominee arrangements and offshore layering. This post examines how Prismatic automates UBO (Ultimate Beneficial Owner) analysis using graph traversal, heuristic detection, and multi-registry correlation.

## The UBO Problem

Anti-money laundering regulations across the EU require identifying any natural person who ultimately owns or controls more than 25% of a legal entity. In theory, this is straightforward. In practice, ownership chains can span multiple jurisdictions, involve trusts and foundations, use nominee shareholders, and deliberately obscure control through circular or pyramidal structures.

Consider a Czech s.r.o. owned 100% by a Slovak s.r.o., which is owned 60% by a Cyprus limited company, which is owned by a BVI trust with unnamed beneficiaries. The Czech beneficial ownership registry (Evidence skutecnych majitelu) might show the registered information, but the actual control chain requires traversing multiple registries and applying heuristic analysis.

## Graph-Based Ownership Modeling

Prismatic models ownership as a directed graph where nodes represent entities (natural persons or legal entities) and edges represent ownership or control relationships with associated percentages and types:

```elixir
defmodule Prismatic.DD.Ownership.Graph do
  @moduledoc """
  Directed graph model for ownership and control relationships.
  Supports traversal, cycle detection, and UBO computation.
  """

  @type node_id :: binary()
  @type edge :: %{
    from: node_id(),
    to: node_id(),
    percentage: float(),
    relationship_type: :direct_ownership | :indirect_ownership | :control | :voting_rights,
    source: atom(),
    confidence: float()
  }

  defstruct nodes: %{}, edges: [], metadata: %{}

  @spec add_ownership(t(), node_id(), node_id(), float(), keyword()) :: t()
  def add_ownership(graph, owner_id, entity_id, percentage, opts \\ []) do
    edge = %{
      from: owner_id,
      to: entity_id,
      percentage: percentage,
      relationship_type: Keyword.get(opts, :type, :direct_ownership),
      source: Keyword.get(opts, :source, :unknown),
      confidence: Keyword.get(opts, :confidence, 1.0)
    }

    %{graph | edges: [edge | graph.edges]}
  end

  @spec find_ubos(t(), node_id(), float()) :: [ubo_result()]
  def find_ubos(graph, entity_id, threshold \\ 0.25) do
    graph
    |> trace_ownership_chains(entity_id, [])
    |> aggregate_by_natural_person()
    |> Enum.filter(fn {_person, total_pct} -> total_pct >= threshold end)
    |> Enum.map(fn {person, total_pct} ->
      %{
        person_id: person,
        effective_ownership: Float.round(total_pct, 4),
        chains: find_chains(graph, person, entity_id),
        flags: detect_flags(graph, person, entity_id)
      }
    end)
    |> Enum.sort_by(& &1.effective_ownership, :desc)
  end
end
```

### Chain Traversal with Cycle Detection

Ownership chains are traversed depth-first with cycle detection to prevent infinite loops in circular ownership structures:

```elixir
defp trace_ownership_chains(graph, target_id, visited) do
  if target_id in visited do
    [{:cycle_detected, target_id, Enum.reverse([target_id | visited])}]
  else
    incoming_edges = Enum.filter(graph.edges, fn e -> e.to == target_id end)

    Enum.flat_map(incoming_edges, fn edge ->
      owner_node = Map.get(graph.nodes, edge.from)

      case owner_node do
        %{type: :natural_person} ->
          [{edge.from, edge.percentage}]

        %{type: :legal_entity} ->
          upstream =
            trace_ownership_chains(graph, edge.from, [target_id | visited])

          Enum.map(upstream, fn
            {:cycle_detected, _, _} = cycle -> cycle
            {person_id, upstream_pct} ->
              {person_id, upstream_pct * edge.percentage}
          end)

        nil ->
          [{:unknown_owner, edge.from, edge.percentage}]
      end
    end)
  end
end
```

Effective ownership percentages multiply along the chain. If Person A owns 60% of Company X, which owns 80% of Company Y, then Person A's effective ownership of Company Y is 48% (0.60 * 0.80).

## Nominee Detection Heuristics

Nominees are natural persons or entities that hold shares on behalf of the true beneficial owner. They are legal in many jurisdictions but create opacity. Prismatic applies several heuristics to flag potential nominee arrangements:

```elixir
defmodule Prismatic.DD.Ownership.NomineeDetector do
  @moduledoc """
  Heuristic detection of nominee shareholder arrangements.
  """

  @nominee_jurisdiction_risk %{
    "BVI" => 0.85,
    "Seychelles" => 0.80,
    "Panama" => 0.75,
    "Cyprus" => 0.45,
    "Luxembourg" => 0.25
  }

  @spec detect_nominee_indicators(map(), map()) :: [indicator()]
  def detect_nominee_indicators(owner, entity) do
    indicators = []

    indicators =
      if high_directorship_count?(owner),
        do: [%{type: :high_directorships, score: 0.7} | indicators],
        else: indicators

    indicators =
      if address_matches_registered_agent?(owner),
        do: [%{type: :registered_agent_address, score: 0.8} | indicators],
        else: indicators

    indicators =
      if jurisdiction_risk_elevated?(owner),
        do: [%{type: :high_risk_jurisdiction, score: jurisdiction_score(owner)} | indicators],
        else: indicators

    indicators =
      if ownership_duration_suspicious?(owner, entity),
        do: [%{type: :brief_ownership, score: 0.6} | indicators],
        else: indicators

    indicators
  end

  defp high_directorship_count?(owner) do
    Map.get(owner, :directorship_count, 0) > 15
  end

  defp address_matches_registered_agent?(owner) do
    owner_address = Map.get(owner, :address, "")
    known_agents = Prismatic.DD.KnownAgents.addresses()
    Enum.any?(known_agents, fn agent_addr ->
      String.jaro_distance(owner_address, agent_addr) > 0.90
    end)
  end
end
```

Key nominee indicators include: a natural person serving as director or shareholder of 15+ companies (corporate service provider pattern), addresses matching known registered agent offices, ownership in high-risk jurisdictions, and very short ownership durations (acquired and transferred within months).

## Czech Beneficial Ownership Registry Integration

The Czech Republic maintains the Evidence skutecnych majitelu (Register of Beneficial Owners), accessible via the Justice Ministry portal. Prismatic integrates with this registry through structured data extraction:

```elixir
defmodule Prismatic.DD.Sources.CzechUBO do
  @moduledoc """
  Czech beneficial ownership registry (Evidence skutecnych majitelu) adapter.
  """

  @behaviour Prismatic.DD.Source

  @impl true
  def fetch(%{ico: ico}, _opts) when is_binary(ico) do
    case query_registry(ico) do
      {:ok, %{beneficiaries: beneficiaries}} ->
        {:ok, %{
          data: %{
            beneficiaries: normalize_beneficiaries(beneficiaries),
            registry_date: Date.utc_today(),
            source_reliability: :official
          },
          confidence: 0.95,
          source: :czech_ubo_registry
        }}

      {:error, :not_found} ->
        {:ok, %{
          data: %{beneficiaries: [], note: "No UBO registration found"},
          confidence: 0.90,
          source: :czech_ubo_registry
        }}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @impl true
  def source_group, do: :registry

  @impl true
  def rate_limit, do: {10, 60_000}

  @impl true
  def priority, do: 2
end
```

The registry provides structured data on declared beneficial owners, but this data is self-reported and not always accurate. Prismatic cross-references registry declarations against independently derived ownership chains to detect discrepancies. When the computed UBO differs from the declared UBO, this creates a high-priority flag for analyst review.

## Offshore Structure Analysis

Multi-layered offshore structures are the primary mechanism for obscuring beneficial ownership. Prismatic tracks several patterns that indicate deliberate opacity:

Pyramidal structures where ownership flows through multiple layers of holding companies, each adding distance between the UBO and the target. Shell companies with no substantive operations, employees, or physical presence beyond a registered office. Jurisdictional layering that exploits differences in disclosure requirements between countries. And trust structures where legal ownership is separated from beneficial interest.

Each pattern contributes to the ownership dimension of the entity's risk score, with the cumulative effect reflecting the overall opacity of the ownership structure.

## Practical Considerations

UBO analysis faces several inherent limitations. Ownership data is often stale, reflecting the last filing rather than current reality. Some jurisdictions have no public ownership registries at all. And control can be exercised through mechanisms other than share ownership, including shareholder agreements, management contracts, and economic dependency.

Prismatic addresses these limitations through confidence scoring at every level. Each ownership edge carries a confidence value reflecting the recency and reliability of the source. The final UBO determination includes an aggregate confidence score that signals when additional investigation is warranted.

The graph-based approach also enables what-if analysis: analysts can hypothesize about unknown ownership links and see how they would change the UBO determination. This is particularly valuable when partial information suggests a structure but complete data is unavailable.

In the Czech M&A context, where many target companies have complex holding structures spanning Central European jurisdictions, automated UBO analysis reduces what was previously a multi-day manual exercise to minutes, while maintaining the analytical rigor that compliance requires.
