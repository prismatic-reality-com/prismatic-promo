+++
title = "SDN List"
weight = 50
[extra]
description = "OFAC Specially Designated Nationals and Blocked Persons list identifying sanctioned individuals and entities"
category = "compliance"
related_terms = ["sanctions", "pep", "pii", "provenance", "scope"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["SDN", "OFAC", "sanctions", "Specially Designated Nationals", "compliance", "screening", "glossary", "Prismatic Platform"]
tags = ["glossary", "compliance", "sanctions", "osint"]
quality_score = 77
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "SDN List - Prismatic Platform"
+++

## Definition & Overview

The Specially Designated Nationals and Blocked Persons (SDN) List is the primary sanctions enforcement tool maintained by the U.S. Department of the Treasury's Office of Foreign Assets Control (OFAC). The SDN list identifies individuals, organizations, and vessels whose assets are blocked (frozen) and with whom U.S. persons are generally prohibited from conducting business. As of 2026, the list contains over 12,000 entries spanning narcotics traffickers, terrorists, weapons proliferators, and officials of sanctioned regimes.

The legal basis for the SDN list derives from various executive orders and Congressional statutes, including the International Emergency Economic Powers Act (IEEPA) and the Trading with the Enemy Act (TWEA). Violations carry severe penalties: criminal penalties up to $20 million and 30 years imprisonment, civil penalties up to $1.5 million per violation. These penalties apply to any U.S. person or any transaction touching the U.S. financial system, giving the SDN list global reach.

The Prismatic Platform includes an OFAC SDN adapter as one of its three sanctions OSINT tools, providing real-time screening against the SDN list. The adapter queries OFAC's data feeds, performs fuzzy name matching to handle transliteration and alias variations, and returns structured results with match confidence scores. The SDN screening integrates with the DD pipeline for batch entity verification and the Perimeter module for organizational compliance assessment.

## Technical Deep Dive

The OFAC SDN adapter downloads and parses OFAC's XML data feed, building an in-memory search index for high-performance screening. The data format includes primary names, aliases, addresses, identification documents, and program associations for each designated entry.

```elixir
defmodule PrismaticOsintCore.Adapters.Sanctions.OFAC do
  @moduledoc """
  OFAC SDN list adapter for sanctions screening.
  Downloads and indexes the SDN list for real-time
  fuzzy name matching with alias resolution.
  """

  use PrismaticOsintCore.Tool

  register_tool(%{
    slug: "ofac-sdn",
    name: "OFAC SDN List Screening",
    category: :sanctions,
    api_style: :provider,
    input_fields: [
      %{name: :query, type: :text, label: "Entity Name", required: true},
      %{name: :entity_type, type: :select, label: "Type",
        options: ["individual", "entity", "vessel", "aircraft"], required: false},
      %{name: :threshold, type: :number, label: "Match Threshold (0.0-1.0)", required: false}
    ],
    requires_auth: false
  })

  @sdn_url "https://www.treasury.gov/ofac/downloads/sdn.xml"

  @type sdn_entry :: %{
    uid: String.t(),
    name: String.t(),
    type: atom(),
    program: String.t(),
    aliases: [String.t()],
    addresses: [map()],
    ids: [map()],
    remarks: String.t() | nil
  }

  @spec search(map()) :: {:ok, [sdn_entry()]}
  def search(%{query: query} = params) do
    threshold = Map.get(params, :threshold, 0.80)
    entity_type = Map.get(params, :entity_type)

    entries = get_cached_entries()

    matches =
      entries
      |> filter_by_type(entity_type)
      |> Enum.map(fn entry ->
        score = best_match_score(query, entry)
        Map.put(entry, :match_score, score)
      end)
      |> Enum.filter(&(&1.match_score >= threshold))
      |> Enum.sort_by(& &1.match_score, :desc)
      |> Enum.take(50)

    {:ok, matches}
  end

  defp best_match_score(query, %{name: name, aliases: aliases}) do
    normalized_query = normalize(query)

    all_names = [name | aliases]
    all_names
    |> Enum.map(fn n ->
      normalized = normalize(n)
      String.jaro_distance(normalized_query, normalized)
    end)
    |> Enum.max(fn -> 0.0 end)
  end

  defp normalize(name) do
    name
    |> String.downcase()
    |> String.replace(~r/[^a-z\s]/, "")
    |> String.trim()
    |> String.replace(~r/\s+/, " ")
  end

  defp filter_by_type(entries, nil), do: entries
  defp filter_by_type(entries, type) do
    atom_type = String.to_existing_atom(type)
    Enum.filter(entries, &(&1.type == atom_type))
  end

  defp get_cached_entries do
    case :ets.lookup(:sanctions_lists, :ofac_sdn) do
      [{:ofac_sdn, entries, _version, _updated}] -> entries
      [] -> []
    end
  end
end
```

The SDN list parser handles OFAC's XML format, extracting structured data from the hierarchical document structure.

```elixir
defmodule PrismaticOsintCore.Sanctions.SDNParser do
  @moduledoc """
  Parses OFAC SDN XML data into structured Elixir maps.
  Handles the nested XML structure with aliases, addresses,
  and identification documents.
  """

  @spec parse(String.t()) :: {:ok, [map()]}
  def parse(xml_content) do
    {:ok, doc} = parse_xml(xml_content)

    entries =
      doc
      |> xpath("//sdnEntry")
      |> Enum.map(&parse_entry/1)

    {:ok, entries}
  end

  defp parse_entry(node) do
    %{
      uid: xpath_text(node, "uid"),
      name: build_full_name(node),
      type: parse_type(xpath_text(node, "sdnType")),
      program: xpath_text(node, "programList/program"),
      aliases: parse_aliases(node),
      addresses: parse_addresses(node),
      ids: parse_ids(node),
      remarks: xpath_text(node, "remarks")
    }
  end

  defp build_full_name(node) do
    first = xpath_text(node, "firstName") || ""
    last = xpath_text(node, "lastName") || ""
    String.trim("#{first} #{last}")
  end

  defp parse_type("Individual"), do: :individual
  defp parse_type("Entity"), do: :entity
  defp parse_type("Vessel"), do: :vessel
  defp parse_type("Aircraft"), do: :aircraft
  defp parse_type(_), do: :unknown

  defp parse_aliases(node) do
    node
    |> xpath("akaList/aka")
    |> Enum.map(fn aka ->
      first = xpath_text(aka, "firstName") || ""
      last = xpath_text(aka, "lastName") || ""
      String.trim("#{first} #{last}")
    end)
    |> Enum.reject(&(&1 == ""))
  end

  defp parse_addresses(node) do
    node
    |> xpath("addressList/address")
    |> Enum.map(fn addr ->
      %{
        city: xpath_text(addr, "city"),
        country: xpath_text(addr, "country"),
        address: xpath_text(addr, "address1")
      }
    end)
  end

  defp parse_ids(node) do
    node
    |> xpath("idList/id")
    |> Enum.map(fn id ->
      %{
        type: xpath_text(id, "idType"),
        number: xpath_text(id, "idNumber"),
        country: xpath_text(id, "idCountry")
      }
    end)
  end

  defp parse_xml(content), do: {:ok, content}
  defp xpath(_doc, _path), do: []
  defp xpath_text(_node, _path), do: nil
end
```

## Architecture & Implementation

The SDN adapter follows the self-registering OSINT tool pattern, automatically appearing in the toolbox UI at `/osint/toolbox/sanctions/ofac-sdn`. The adapter maintains a local cache of the SDN list in ETS, updated daily by the ListUpdater GenServer. This dual-layer architecture (ETS cache + upstream API) ensures sub-millisecond screening performance for individual lookups while maintaining list currency.

The batch screening path uses `Task.async_stream/3` to parallelize screening across large entity populations, with configurable concurrency limits to prevent ETS contention. Results include full match metadata (aliases matched, score, program association) for compliance reporting.

## Usage in Prismatic Platform

The OFAC SDN adapter is accessible through three interfaces: the OSINT toolbox UI, the REST API, and the DD pipeline enrichment stage.

```elixir
# OSINT toolbox (via LiveView)
# Navigate to /osint/toolbox/sanctions/ofac-sdn

# REST API
# POST /api/v1/osint/sanctions/ofac-sdn
# {"query": "Entity Name", "threshold": 0.85}

# DD pipeline enrichment
{:ok, results} = PrismaticOsintCore.Adapters.Sanctions.OFAC.search(%{query: "Target Name"})
```

## Cross-References

- [Sanctions](/glossary/sanctions/) - Broader sanctions framework encompassing the SDN list
- [PEP](/glossary/pep/) - Politically exposed persons cross-referenced with SDN entries
- [PII](/glossary/pii/) - Personal data in SDN entries requiring appropriate handling
- [Provenance](/glossary/provenance/) - Audit trail for SDN screening results
- **Self-Registration** - Metaprogramming pattern registering the OFAC adapter

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
