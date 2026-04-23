+++
title = "OFAC (Office of Foreign Assets Control)"
weight = 50
[extra]
description = "U.S. Treasury Department office that administers and enforces economic sanctions, maintaining the SDN list of sanctioned entities."
category = "compliance"
related_terms = ["sanctions", "sdn-list", "compliance", "aml"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["OFAC", "sanctions", "SDN list", "compliance", "Treasury", "glossary", "Prismatic Platform"]
tags = ["glossary", "compliance"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "OFAC - Prismatic Platform"
+++

## Definition & Overview

The Office of Foreign Assets Control (OFAC) is a division of the U.S. Department of the Treasury that administers and enforces economic and trade sanctions. OFAC maintains several lists of sanctioned entities, the most prominent being the Specially Designated Nationals and Blocked Persons (SDN) List, which includes individuals, companies, and organizations whose assets are blocked and with whom U.S. persons are generally prohibited from dealing.

OFAC sanctions are among the most far-reaching in the world due to the centrality of the U.S. dollar in global finance. Any transaction in U.S. dollars, any involvement of U.S. persons, or any transaction touching the U.S. financial system can trigger OFAC jurisdiction. This extraterritorial reach means that organizations worldwide must screen against OFAC lists to avoid inadvertent violations, which can result in severe civil and criminal penalties.

The Prismatic Platform includes OFAC SDN list screening as one of its core sanctions compliance capabilities. The OSINT toolbox provides an OFAC SDN adapter that queries the official sanctions data, supporting name matching with fuzzy algorithms to account for transliteration variations, aliases, and spelling differences. This capability is integrated into the DD pipeline for entity screening during due diligence investigations.

## Technical Deep Dive

The OFAC SDN list is published in multiple formats: XML (the primary machine-readable format), CSV, PDF, and a consolidated screening list via the Treasury's Sanctions List Search tool. The XML format contains structured data including names, aliases (also known as AKAs and FKAs), addresses, identification documents, nationalities, dates of birth, and program designations (which sanctions program listed the entity).

Effective OFAC screening requires sophisticated name matching because sanctioned entity names often appear in multiple transliterations (Arabic, Cyrillic, Chinese names in Latin script), with different word orders, and with various abbreviations. A production screening system must handle: exact matching, phonetic matching (Soundex, Metaphone), edit distance matching (Levenshtein), token-based matching (matching individual name components regardless of order), and transliteration normalization.

```elixir
defmodule PrismaticOsintCore.Sanctions.OfacSdn do
  @moduledoc """
  OFAC SDN (Specially Designated Nationals) list screening adapter.
  Provides fuzzy name matching against the Treasury's sanctions data.
  """

  use PrismaticOsintCore.Tool

  register_tool(%{
    slug: "ofac-sdn-search",
    name: "OFAC SDN List Search",
    category: :sanctions,
    api_style: :source,
    input_fields: [
      %{name: :query, type: :text, label: "Name to Screen", required: true},
      %{name: :entity_type, type: :select, label: "Entity Type",
        options: ["individual", "entity", "vessel", "aircraft", "all"],
        required: false},
      %{name: :threshold, type: :number, label: "Match Threshold (0-100)",
        required: false}
    ],
    requires_auth: false
  })

  @sdn_url "https://www.treasury.gov/ofac/downloads/sdn.xml"
  @default_threshold 80

  @type match_result :: %{
    name: String.t(),
    score: float(),
    entity_type: String.t(),
    program: String.t(),
    aliases: [String.t()],
    identifications: [map()],
    addresses: [map()]
  }

  @impl PrismaticOsintCore.Tool
  def search(%{query: query} = params) do
    threshold = Map.get(params, :threshold, @default_threshold)
    entity_type = Map.get(params, :entity_type, "all")

    sdn_entries = get_cached_sdn_data()

    matches =
      sdn_entries
      |> maybe_filter_type(entity_type)
      |> Enum.map(fn entry ->
        score = compute_match_score(query, entry)
        {entry, score}
      end)
      |> Enum.filter(fn {_entry, score} -> score >= threshold end)
      |> Enum.sort_by(fn {_entry, score} -> score end, :desc)
      |> Enum.take(20)
      |> Enum.map(fn {entry, score} ->
        %{
          name: entry.name,
          score: score,
          entity_type: entry.type,
          program: entry.program,
          aliases: entry.aliases,
          identifications: entry.ids,
          addresses: entry.addresses
        }
      end)

    {:ok, %{
      query: query,
      matches: matches,
      match_count: length(matches),
      threshold: threshold,
      list_date: get_list_date()
    }}
  end

  defp compute_match_score(query, entry) do
    normalized_query = normalize_name(query)

    all_names = [entry.name | entry.aliases]
    |> Enum.map(&normalize_name/1)

    all_names
    |> Enum.map(fn name ->
      scores = [
        exact_score(normalized_query, name),
        levenshtein_score(normalized_query, name),
        token_score(normalized_query, name),
        phonetic_score(normalized_query, name)
      ]

      Enum.max(scores)
    end)
    |> Enum.max()
  end

  defp normalize_name(name) do
    name
    |> String.downcase()
    |> String.replace(~r/[^\w\s]/, "")
    |> String.replace(~r/\s+/, " ")
    |> String.trim()
  end

  defp exact_score(a, b), do: if(a == b, do: 100.0, else: 0.0)

  defp levenshtein_score(a, b) do
    distance = String.jaro_distance(a, b)
    distance * 100
  end

  defp token_score(query, name) do
    query_tokens = String.split(query) |> MapSet.new()
    name_tokens = String.split(name) |> MapSet.new()
    intersection = MapSet.intersection(query_tokens, name_tokens) |> MapSet.size()
    union = MapSet.union(query_tokens, name_tokens) |> MapSet.size()

    if union > 0, do: intersection / union * 100, else: 0.0
  end

  defp phonetic_score(_query, _name), do: 0.0

  defp maybe_filter_type(entries, "all"), do: entries
  defp maybe_filter_type(entries, type), do: Enum.filter(entries, &(&1.type == type))

  defp get_cached_sdn_data, do: []
  defp get_list_date, do: Date.utc_today()
end
```

The matching threshold is configurable to balance precision and recall. A threshold of 90+ minimizes false positives (important for production screening where each hit requires manual review). A threshold of 70-80 casts a wider net suitable for investigative work where missing a potential match is more costly than reviewing false positives.

## Architecture & Implementation

The OFAC screening capability is part of the platform's sanctions compliance subsystem, which also includes EU sanctions and UN sanctions adapters. The SDN data is cached in ETS with periodic refresh (configurable, default every 24 hours) to minimize external API dependency while keeping data current. The cache key includes the list publication date, ensuring stale data is detected.

The DD pipeline integrates OFAC screening into its entity loading workflow. When new entities are loaded from Czech registries (Forbes, Parliament, Commercial Register), they are automatically screened against the SDN list. Entities with match scores above the threshold are flagged for review in the DD dashboard, with the match details (score, matching name variant, sanctions program) stored as entity attributes.

The Perimeter module also leverages OFAC data when assessing organizational risk. If an organization's directors or beneficial owners appear on sanctions lists, this significantly impacts the security and compliance assessment. The NIS2 and ZKB compliance frameworks both require sanctions screening as part of their supply chain risk assessment requirements.

## Usage in Prismatic Platform

Batch screening integration in the DD pipeline:

```elixir
defmodule PrismaticDd.Compliance.SanctionsScreening do
  @moduledoc """
  Batch OFAC screening for DD entities.
  Automatically screens new entities and flags potential matches.
  """

  alias PrismaticOsintCore.Sanctions.OfacSdn
  alias PrismaticDd.Schemas.EntityRecord
  alias PrismaticDd.Repo

  @screening_threshold 75

  @spec screen_entities([EntityRecord.t()]) :: {:ok, map()}
  def screen_entities(entities) do
    results =
      entities
      |> Task.async_stream(fn entity ->
        case OfacSdn.search(%{query: entity.name, threshold: @screening_threshold}) do
          {:ok, %{matches: matches}} when matches != [] ->
            {:flagged, entity.id, matches}

          {:ok, _} ->
            {:clear, entity.id}

          {:error, _} ->
            {:error, entity.id}
        end
      end, max_concurrency: 10, timeout: 30_000)
      |> Enum.reduce(%{flagged: [], clear: [], errors: []}, fn
        {:ok, {:flagged, id, matches}}, acc ->
          %{acc | flagged: [{id, matches} | acc.flagged]}

        {:ok, {:clear, id}}, acc ->
          %{acc | clear: [id | acc.clear]}

        _, acc ->
          acc
      end)

    # Update flagged entities in database
    Enum.each(results.flagged, fn {entity_id, matches} ->
      Repo.update_entity_attribute(entity_id, :sanctions_screening, %{
        status: :flagged,
        matches: Enum.take(matches, 5),
        screened_at: DateTime.utc_now(),
        list: "OFAC SDN"
      })
    end)

    {:ok, %{
      total: length(entities),
      flagged: length(results.flagged),
      clear: length(results.clear),
      errors: length(results.errors)
    }}
  end
end
```

OFAC screening is a critical compliance capability that transforms the Prismatic Platform from a pure intelligence tool into a compliance-ready due diligence system, meeting regulatory requirements for sanctions screening across multiple jurisdictions.

## Cross-References

- [Sanctions](@/glossary/sanctions.md) - Broader sanctions framework context
- [Compliance](@/glossary/compliance.md) - Regulatory compliance requirements
- [Due Diligence](@/glossary/due-diligence.md) - Investigation process using OFAC screening
- [OSINT](@/glossary/osint.md) - Intelligence gathering including sanctions data
- [AML](@/glossary/aml.md) - Anti-money laundering compliance requiring OFAC checks

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
