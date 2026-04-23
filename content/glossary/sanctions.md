+++
title = "Sanctions"
weight = 50
[extra]
description = "International restrictive measures targeting individuals, entities, and countries to enforce foreign policy and security objectives"
category = "compliance"
related_terms = ["pep", "sdn-list", "pii", "provenance", "scope"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["sanctions", "OFAC", "EU sanctions", "UN sanctions", "compliance", "screening", "glossary", "Prismatic Platform"]
tags = ["glossary", "compliance", "osint", "sanctions"]
quality_score = 78
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Sanctions - Prismatic Platform"
+++

## Definition & Overview

Sanctions are restrictive measures imposed by governments, international organizations, or supranational bodies to achieve foreign policy, national security, or human rights objectives without resorting to armed conflict. Sanctions can target countries (comprehensive sanctions), specific sectors (sectoral sanctions), or identified individuals and entities (targeted or "smart" sanctions). Common measures include asset freezes, travel bans, trade restrictions, financial transaction prohibitions, and arms embargoes.

The primary sanctions regimes relevant to the Prismatic Platform include: United States (OFAC -- Office of Foreign Assets Control, administering the SDN list and sectoral programs), European Union (EU Consolidated Financial Sanctions List), United Nations Security Council (UNSC Consolidated List), and the Czech Republic (implementing EU sanctions plus national measures). Each regime has distinct legal authority, scope, and enforcement mechanisms, but they frequently overlap -- an individual sanctioned by the UN is typically also sanctioned by the EU and the US.

Sanctions screening is a legal obligation for financial institutions, intelligence platforms, and any entity that facilitates cross-border transactions or relationships. The Prismatic Platform provides sanctions screening through three dedicated OSINT adapters (EU, OFAC SDN, UN) that query authoritative sanctions lists in real-time. The screening integrates with the DD pipeline for batch entity verification and the Perimeter module for organizational compliance assessment.

## Technical Deep Dive

Sanctions screening requires matching entity names against official sanctions lists while handling the inherent challenges of multilingual name matching, transliteration variations, aliases, and frequently updated lists. The technical implementation must balance thoroughness (never missing a true match) with precision (minimizing false positives that create operational burden).

```elixir
defmodule PrismaticOsintCore.Sanctions.Screener do
  @moduledoc """
  Multi-regime sanctions screening engine querying EU, OFAC,
  and UN sanctions lists with fuzzy matching and alias resolution.
  """

  @type screening_result :: %{
    entity: String.t(),
    matches: [match()],
    regime: atom(),
    screened_at: DateTime.t(),
    list_version: String.t()
  }

  @type match :: %{
    name: String.t(),
    aliases: [String.t()],
    regime: atom(),
    program: String.t(),
    score: float(),
    sanctions_type: atom(),
    listed_since: Date.t() | nil
  }

  @regimes [:eu, :ofac_sdn, :un]

  @spec screen(String.t(), keyword()) :: {:ok, [screening_result()]}
  def screen(entity_name, opts \\ []) do
    regimes = Keyword.get(opts, :regimes, @regimes)
    threshold = Keyword.get(opts, :threshold, 0.80)

    results =
      regimes
      |> Task.async_stream(fn regime ->
        screen_against_regime(entity_name, regime, threshold)
      end, max_concurrency: 3, timeout: 15_000)
      |> Enum.map(fn
        {:ok, result} -> result
        {:exit, _reason} -> %{matches: [], regime: :unknown, error: :timeout}
      end)

    {:ok, results}
  end

  defp screen_against_regime(name, :ofac_sdn, threshold) do
    adapter = PrismaticOsintCore.Adapters.Sanctions.OFAC
    {:ok, entries} = adapter.search(%{query: name})

    matches =
      entries
      |> Enum.map(fn entry ->
        score = compute_similarity(name, entry.name, entry.aliases)
        Map.put(entry, :score, score)
      end)
      |> Enum.filter(&(&1.score >= threshold))
      |> Enum.sort_by(& &1.score, :desc)

    %{entity: name, matches: matches, regime: :ofac_sdn, screened_at: DateTime.utc_now()}
  end

  defp screen_against_regime(name, :eu, threshold) do
    adapter = PrismaticOsintCore.Adapters.Sanctions.EU
    {:ok, entries} = adapter.search(%{query: name})

    matches =
      entries
      |> Enum.map(fn entry ->
        score = compute_similarity(name, entry.name, entry.aliases)
        Map.put(entry, :score, score)
      end)
      |> Enum.filter(&(&1.score >= threshold))

    %{entity: name, matches: matches, regime: :eu, screened_at: DateTime.utc_now()}
  end

  defp screen_against_regime(name, :un, threshold) do
    adapter = PrismaticOsintCore.Adapters.Sanctions.UN
    {:ok, entries} = adapter.search(%{query: name})

    matches =
      entries
      |> Enum.map(fn entry ->
        score = compute_similarity(name, entry.name, Map.get(entry, :aliases, []))
        Map.put(entry, :score, score)
      end)
      |> Enum.filter(&(&1.score >= threshold))

    %{entity: name, matches: matches, regime: :un, screened_at: DateTime.utc_now()}
  end

  defp compute_similarity(query, target, aliases) do
    all_names = [target | aliases]

    all_names
    |> Enum.map(&String.jaro_distance(String.downcase(query), String.downcase(&1)))
    |> Enum.max()
  end
end
```

The platform maintains local caches of sanctions lists, updated daily from authoritative sources. This ensures screening remains available even during upstream service outages and provides consistent sub-second response times.

```elixir
defmodule PrismaticOsintCore.Sanctions.ListUpdater do
  @moduledoc """
  Periodic updater for sanctions list caches. Downloads
  authoritative lists from EU, OFAC, and UN sources and
  updates the local ETS cache.
  """

  use GenServer

  @update_interval 86_400_000  # 24 hours
  @ets_table :sanctions_lists

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    :ets.new(@ets_table, [:named_table, :set, :public, read_concurrency: true])
    send(self(), :update)
    {:ok, %{last_update: nil, versions: %{}}}
  end

  @impl true
  def handle_info(:update, state) do
    versions =
      [:eu, :ofac_sdn, :un]
      |> Task.async_stream(&fetch_and_cache/1, timeout: 60_000)
      |> Enum.reduce(%{}, fn
        {:ok, {regime, version}} -> Map.put(state.versions, regime, version)
        _ -> state.versions
      end)

    schedule_update()
    {:noreply, %{state | last_update: DateTime.utc_now(), versions: versions}}
  end

  defp fetch_and_cache(regime) do
    {:ok, entries, version} = download_list(regime)
    :ets.insert(@ets_table, {regime, entries, version, DateTime.utc_now()})
    {regime, version}
  end

  defp download_list(:ofac_sdn) do
    # Download from https://www.treasury.gov/ofac/downloads/sdn.xml
    {:ok, [], "2026-02-24"}
  end

  defp download_list(:eu) do
    # Download from EU consolidated list API
    {:ok, [], "2026-02-24"}
  end

  defp download_list(:un) do
    # Download from UN Security Council consolidated list
    {:ok, [], "2026-02-24"}
  end

  defp schedule_update, do: Process.send_after(self(), :update, @update_interval)
end
```

## Architecture & Implementation

Sanctions screening in the Prismatic Platform follows the self-registering OSINT tool pattern. Each sanctions adapter (`EU`, `OFAC`, `UN`) is registered via `use PrismaticOsintCore.Tool`, making it automatically available in the toolbox UI, REST API, and DD pipeline. The screening engine orchestrates parallel queries across all registered sanctions adapters and merges results into a unified compliance assessment.

The architecture supports both real-time screening (individual entity checks via the OSINT toolbox or API) and batch screening (entire entity populations via the DD pipeline). Batch screening uses connection pooling and rate limiting to avoid overwhelming upstream services while maintaining throughput for large entity sets.

## Usage in Prismatic Platform

The three sanctions OSINT adapters are self-registered and available at `/osint/toolbox/sanctions/`. They integrate with the DD pipeline for automated entity screening and the Perimeter module for organizational compliance assessment.

```elixir
# Real-time screening via OSINT toolbox
{:ok, results} = PrismaticOsintCore.Sanctions.Screener.screen("John Smith", regimes: [:ofac_sdn, :eu])

# Batch screening via DD pipeline
{:ok, screened} = PrismaticDd.Enrichment.SanctionsEnricher.enrich_batch(entities, regimes: :all)

# Compliance check via Perimeter
{:ok, assessment} = PrismaticPerimeter.assess_compliance("example.com", [:sanctions_screening])
```

## Cross-References

- [PEP](/glossary/pep/) - Politically exposed persons often cross-referenced with sanctions lists
- **SDN List** - OFAC's primary sanctions list of designated individuals
- [PII](/glossary/pii/) - Personal data processed during sanctions screening
- [Provenance](/glossary/provenance/) - Audit trail requirements for sanctions screening results
- **Self-Registration** - Pattern enabling automatic exposure of sanctions tools

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
