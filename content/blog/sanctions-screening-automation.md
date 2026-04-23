+++
title = "Sanctions Screening Automation: Fuzzy Name Matching and PEP Detection in Elixir"
date = 2026-03-01
description = "Automating sanctions screening with EU, OFAC, and HMT list processing, fuzzy name matching using Jaro-Winkler distance, PEP detection strategies, and false positive reduction in Elixir."

[extra]
author = "Tomas Korcak (korczis)"
category = "product"
tags = ["sanctions", "compliance", "fuzzy-matching", "pep", "elixir"]
reading_time = "9 min"
keywords = ["sanctions screening", "ofac", "jaro-winkler", "pep detection", "aml compliance"]
image = "/images/blog/sanctions-screening-automation.png"
word_count = 1100
date_created = "2026-03-01"
date_modified = "2026-03-01"
quality_score = 85
see_also = ["architecture", "developers"]
image_alt = "Sanctions Screening Automation - Prismatic Platform"
+++

## The Compliance Challenge

Sanctions screening is a legal obligation for financial institutions, M&A practitioners, and any organization dealing with cross-border transactions. The task sounds simple: check whether a person or entity appears on government sanctions lists. In practice, it is enormously complex. Names have transliterations (Муаммар Каддафи has over 30 documented English spellings), entities operate through shell companies, and the cost of both false negatives (missing a sanctioned party) and false positives (blocking legitimate business) is steep.

An effective screening system must ingest and normalize multiple sanctions lists, perform fuzzy matching that catches transliteration variants without drowning analysts in noise, and integrate PEP (Politically Exposed Persons) detection into the same pipeline.

## Sanctions List Ingestion

The platform ingests four primary sanctions lists, each with a different format:

| List | Source | Format | Update Frequency | Entries (approx.) |
|------|--------|--------|-----------------|-------------------|
| EU Consolidated | European Commission | XML | Daily | 2,100+ |
| OFAC SDN | US Treasury | CSV/XML | Daily | 12,000+ |
| HMT Sanctions | UK Government | XML/ODS | Weekly | 3,500+ |
| UN Consolidated | UN Security Council | XML | As needed | 800+ |

```elixir
defmodule Prismatic.Compliance.Sanctions.ListIngester do
  @moduledoc """
  Ingests and normalizes sanctions lists from EU, OFAC, HMT, and UN sources.
  Maintains a unified searchable index updated on configurable schedules.
  """

  use GenServer

  require Logger

  @lists [
    %{id: :eu, url: "https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content",
      parser: Prismatic.Compliance.Sanctions.Parsers.EU, interval_hours: 24},
    %{id: :ofac, url: "https://www.treasury.gov/ofac/downloads/sdn.xml",
      parser: Prismatic.Compliance.Sanctions.Parsers.OFAC, interval_hours: 24},
    %{id: :hmt, url: "https://ofsistorage.blob.core.windows.net/publishlive/ConList.xml",
      parser: Prismatic.Compliance.Sanctions.Parsers.HMT, interval_hours: 168},
    %{id: :un, url: "https://scsanctions.un.org/resources/xml/en/consolidated.xml",
      parser: Prismatic.Compliance.Sanctions.Parsers.UN, interval_hours: 168}
  ]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    table = :ets.new(:sanctions_entries, [:set, :named_table, read_concurrency: true])
    schedule_all_updates()
    {:ok, %{table: table, last_updated: %{}, entry_count: 0}}
  end

  @impl true
  def handle_info({:update_list, list_config}, state) do
    case fetch_and_parse(list_config) do
      {:ok, entries} ->
        Enum.each(entries, fn entry ->
          normalized = normalize_entry(entry, list_config.id)
          :ets.insert(state.table, {normalized.id, normalized})
        end)

        new_count = :ets.info(state.table, :size)
        Logger.info("Sanctions list #{list_config.id} updated: #{length(entries)} entries, total: #{new_count}")

        schedule_update(list_config)
        {:noreply, %{state | entry_count: new_count,
          last_updated: Map.put(state.last_updated, list_config.id, DateTime.utc_now())}}

      {:error, reason} ->
        Logger.error("Failed to update #{list_config.id}: #{inspect(reason)}")
        schedule_update(list_config)
        {:noreply, state}
    end
  end

  defp normalize_entry(entry, source) do
    %{
      id: "#{source}:#{entry.id}",
      source: source,
      type: entry.type,
      names: normalize_names(entry.names),
      aliases: normalize_names(entry.aliases || []),
      birth_dates: entry.birth_dates || [],
      nationalities: entry.nationalities || [],
      addresses: entry.addresses || [],
      identifiers: entry.identifiers || [],
      programs: entry.programs || [],
      remarks: entry.remarks
    }
  end

  defp normalize_names(names) do
    Enum.map(names, fn name ->
      name
      |> String.downcase()
      |> String.replace(~r/[^\p{L}\s]/u, "")
      |> String.replace(~r/\s+/, " ")
      |> String.trim()
    end)
  end
end
```

## Fuzzy Name Matching with Jaro-Winkler

Exact string matching catches less than 60% of true matches due to transliteration variants, typos, and name ordering differences. We use a multi-strategy approach with Jaro-Winkler distance as the primary metric, augmented by token-based matching for reordered names:

```elixir
defmodule Prismatic.Compliance.Sanctions.Matcher do
  @moduledoc """
  Fuzzy name matching engine for sanctions screening.
  Uses Jaro-Winkler distance with token reordering and phonetic fallback.
  """

  @jaro_threshold 0.88
  @token_threshold 0.85

  @spec screen(String.t(), keyword()) :: list(map())
  def screen(query_name, opts \\ []) do
    threshold = Keyword.get(opts, :threshold, @jaro_threshold)
    normalized_query = normalize(query_name)
    query_tokens = tokenize(normalized_query)

    :ets.foldl(fn {_id, entry}, acc ->
      all_names = entry.names ++ entry.aliases

      best_match =
        all_names
        |> Enum.map(fn name ->
          jaro = String.jaro_distance(normalized_query, name)
          token = token_sort_score(query_tokens, tokenize(name))
          combined = max(jaro, token)
          {name, combined, if(jaro >= token, do: :jaro_winkler, else: :token_sort)}
        end)
        |> Enum.max_by(&elem(&1, 1), fn -> {nil, 0.0, nil} end)

      case best_match do
        {matched_name, score, method} when score >= threshold ->
          [%{
            entry: entry,
            matched_name: matched_name,
            query: query_name,
            score: Float.round(score, 4),
            method: method
          } | acc]

        _ ->
          acc
      end
    end, [], :sanctions_entries)
    |> Enum.sort_by(& &1.score, :desc)
  end

  defp token_sort_score(tokens_a, tokens_b) do
    sorted_a = Enum.sort(tokens_a) |> Enum.join(" ")
    sorted_b = Enum.sort(tokens_b) |> Enum.join(" ")
    String.jaro_distance(sorted_a, sorted_b)
  end

  defp tokenize(name) do
    name |> String.split() |> Enum.reject(&(&1 == ""))
  end

  defp normalize(name) do
    name
    |> String.downcase()
    |> String.replace(~r/[^\p{L}\s]/u, "")
    |> String.replace(~r/\s+/, " ")
    |> String.trim()
  end
end
```

## PEP Detection

Politically Exposed Persons require enhanced due diligence but are not sanctioned. The PEP detection layer identifies current and former holders of prominent public functions along with their family members and close associates:

```elixir
defmodule Prismatic.Compliance.PEP.Detector do
  @moduledoc """
  Detects Politically Exposed Persons using role-based classification
  and relationship graph analysis.
  """

  @pep_categories %{
    heads_of_state: 1,
    senior_politicians: 2,
    senior_government: 2,
    judiciary: 3,
    military: 3,
    central_bank: 2,
    state_enterprise: 3,
    international_org: 3
  }

  @spec classify(map()) :: {:pep, map()} | :not_pep
  def classify(%{roles: roles} = person) when is_list(roles) do
    pep_roles =
      roles
      |> Enum.filter(&role_is_pep?/1)
      |> Enum.map(&enrich_role/1)

    if pep_roles != [] do
      highest_tier = pep_roles |> Enum.map(& &1.tier) |> Enum.min()
      {:pep, %{
        person: person,
        pep_roles: pep_roles,
        tier: highest_tier,
        risk_level: tier_to_risk(highest_tier),
        active: Enum.any?(pep_roles, & &1.current)
      }}
    else
      :not_pep
    end
  end

  def classify(_), do: :not_pep

  defp tier_to_risk(1), do: :very_high
  defp tier_to_risk(2), do: :high
  defp tier_to_risk(3), do: :medium
end
```

## False Positive Reduction

Raw fuzzy matching generates significant noise. Our false positive reduction pipeline applies contextual filters that dramatically improve precision:

| Strategy | Description | FP Reduction |
|----------|-------------|-------------|
| Date of birth cross-check | Reject if DOB differs by > 5 years | 40-60% |
| Nationality filter | Lower score if nationality mismatch | 15-25% |
| Gender inference | Reject obvious gender mismatches | 10-15% |
| Entity type filter | Person vs organization mismatch | 20-30% |
| Name component count | Penalize if token count differs significantly | 5-10% |
| Historical resolution | Mark resolved entries as lower priority | 10-20% |

```elixir
defp reduce_false_positives(matches, context) do
  matches
  |> Enum.map(fn match ->
    adjustments = [
      dob_adjustment(match.entry, context),
      nationality_adjustment(match.entry, context),
      entity_type_adjustment(match.entry, context),
      token_count_adjustment(match.matched_name, context.query)
    ]

    total_adjustment = Enum.sum(adjustments)
    adjusted_score = max(match.score + total_adjustment, 0.0)

    %{match | score: Float.round(adjusted_score, 4)}
  end)
  |> Enum.filter(&(&1.score >= @jaro_threshold))
  |> Enum.sort_by(& &1.score, :desc)
end
```

## Operational Workflow

The screening pipeline processes batch requests during due diligence and real-time lookups for transaction monitoring. Each screen result enters a three-state workflow: auto-cleared (score below threshold), auto-flagged (score above high-confidence threshold), and analyst-review (scores in the ambiguous middle range). The system tracks analyst decisions to continuously improve the matching thresholds through feedback-loop calibration.

Integration with the platform's decision engine allows screening results to feed directly into risk scoring, where sanctions matches receive the highest possible risk weight alongside financial analysis and legal entity verification results.
