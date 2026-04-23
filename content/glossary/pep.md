+++
title = "PEP (Politically Exposed Person)"
weight = 50
[extra]
description = "Individual holding prominent public office requiring enhanced due diligence in anti-money laundering compliance"
category = "compliance"
related_terms = ["sanctions", "sdn-list", "pii", "due-diligence", "aml", "kyc", "risk-scoring"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["PEP", "Politically Exposed Person", "AML", "compliance", "glossary", "Prismatic Platform", "due diligence", "KYC"]
tags = ["glossary", "compliance", "osint", "due-diligence"]
quality_score = 78
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "PEP (Politically Exposed Person) - Prismatic Platform"
+++

## Definition & Overview

A Politically Exposed Person (PEP) is an individual who holds or has held a prominent public function, such as a head of state, senior government official, judicial officer, military leader, or executive of a state-owned enterprise. The concept extends to immediate family members and close associates of such individuals, creating a network of heightened risk that compliance programs must monitor. PEP screening is a cornerstone of anti-money laundering (AML) and know-your-customer (KYC) regulations worldwide.

The rationale behind PEP classification stems from the elevated corruption risk associated with public power. Individuals in positions of political influence have greater opportunity to engage in bribery, embezzlement, or illicit enrichment. Financial institutions, intelligence platforms, and regulatory bodies are therefore required to apply Enhanced Due Diligence (EDD) when interacting with PEPs. The Financial Action Task Force (FATF) Recommendations 12 and 22 mandate PEP screening as a baseline compliance requirement across all member jurisdictions.

PEP categorization typically follows a tiered approach: domestic PEPs (holding office in the home country), foreign PEPs (holding office abroad), and international organization PEPs (officials of bodies like the UN, EU, or World Bank). Each tier carries different risk weightings and due diligence requirements. The Prismatic Platform integrates PEP screening across its OSINT toolbox and DD pipeline, enabling real-time identification and risk assessment of politically exposed individuals.

## Technical Deep Dive

PEP screening operates at the intersection of entity resolution, fuzzy name matching, and structured data enrichment. The technical challenge lies in matching imprecise, multilingual names against authoritative PEP databases while minimizing both false positives (legitimate matches flagged incorrectly) and false negatives (actual PEPs missed by screening).

The matching pipeline involves several stages: input normalization (handling diacritics, transliteration, name order variations), candidate generation (blocking strategies that reduce the comparison space), similarity scoring (combining phonetic algorithms like Soundex/Metaphone with edit distance metrics), and threshold-based decision logic. Each stage must handle the inherent ambiguity of personal names across cultures -- a Czech politician named "Tomas" might appear as "Tomáš", "Thomas", or "Tomas" in different databases.

```elixir
defmodule PrismaticOsint.PEP.Matcher do
  @moduledoc """
  Fuzzy name matching engine for PEP screening with configurable
  similarity thresholds and multi-algorithm scoring.
  """

  @type match_result :: %{
    name: String.t(),
    score: float(),
    category: :domestic | :foreign | :international,
    position: String.t(),
    country: String.t(),
    confidence: :high | :medium | :low
  }

  @spec screen(String.t(), keyword()) :: {:ok, [match_result()]} | {:error, term()}
  def screen(name, opts \\ []) do
    threshold = Keyword.get(opts, :threshold, 0.85)
    databases = Keyword.get(opts, :databases, [:all])

    with {:ok, normalized} <- normalize_name(name),
         {:ok, candidates} <- generate_candidates(normalized, databases),
         scored <- score_candidates(normalized, candidates) do
      matches =
        scored
        |> Enum.filter(fn %{score: s} -> s >= threshold end)
        |> Enum.sort_by(& &1.score, :desc)
        |> Enum.map(&assign_confidence/1)

      {:ok, matches}
    end
  end

  defp normalize_name(name) do
    normalized =
      name
      |> String.downcase()
      |> :unicode.characters_to_nfd_binary()
      |> String.replace(~r/[\x{0300}-\x{036f}]/, "")
      |> String.replace(~r/[^a-z\s]/, "")
      |> String.trim()

    {:ok, normalized}
  end

  defp assign_confidence(%{score: score} = match) do
    confidence =
      cond do
        score >= 0.95 -> :high
        score >= 0.85 -> :medium
        true -> :low
      end

    Map.put(match, :confidence, confidence)
  end
end
```

PEP databases are typically structured as hierarchical records linking the individual to their positions, jurisdictions, dates of service, and associated entities (family members, business associates). The data model must support temporal queries -- a person who left office five years ago may still carry PEP risk depending on jurisdictional requirements (typically 12-18 months post-office, though some frameworks extend to permanent classification).

## Architecture & Implementation

The Prismatic Platform implements PEP screening as part of its broader OSINT and DD pipeline architecture. PEP data flows through three subsystems: the OSINT toolbox (real-time screening), the DD pipeline (batch entity enrichment), and the Perimeter module (compliance assessment for monitored organizations).

```elixir
defmodule PrismaticDd.Enrichment.PEPEnricher do
  @moduledoc """
  Enriches DD entities with PEP classification data.
  Integrates with multiple PEP databases via the OSINT adapter pattern.
  """

  @behaviour PrismaticDd.Enrichment

  @impl true
  def enrich(%{type: :person, name: name} = entity, opts) do
    sources = Keyword.get(opts, :pep_sources, [:czech_registry, :eu_pep_db, :opensanctions])

    results =
      sources
      |> Task.async_stream(fn source ->
        PrismaticOsint.PEP.Matcher.screen(name, database: source)
      end, max_concurrency: 3, timeout: 10_000)
      |> Enum.flat_map(fn
        {:ok, {:ok, matches}} -> matches
        _ -> []
      end)

    pep_status = determine_pep_status(results)

    enriched = Map.merge(entity, %{
      pep_status: pep_status,
      pep_matches: results,
      pep_screened_at: DateTime.utc_now()
    })

    {:ok, enriched}
  end

  defp determine_pep_status(matches) do
    case Enum.filter(matches, &(&1.confidence == :high)) do
      [] -> :not_pep
      [_] -> :possible_pep
      _ -> :confirmed_pep
    end
  end
end
```

The architecture ensures PEP screening is both real-time capable (via individual OSINT tool queries) and batch-efficient (via the DD pipeline enrichment stage). All screening results are persisted with full provenance -- every match includes the source database, matching algorithm, similarity score, and timestamp, satisfying regulatory audit trail requirements.

## Usage in Prismatic Platform

PEP screening integrates with multiple Prismatic subsystems. The OSINT toolbox exposes PEP screening as a self-registered tool, the DD pipeline includes PEP enrichment in its entity processing workflow, and the Perimeter module uses PEP exposure as a factor in organizational risk scoring.

```elixir
defmodule PrismaticOsintCore.Tools.PEPScreening do
  use PrismaticOsintCore.Tool

  register_tool(%{
    slug: "pep-screening",
    name: "PEP Screening",
    category: :global,
    api_style: :provider,
    input_fields: [
      %{name: :name, type: :text, label: "Person Name", required: true},
      %{name: :country, type: :text, label: "Country (ISO)", required: false},
      %{name: :threshold, type: :number, label: "Match Threshold", required: false}
    ],
    requires_auth: false
  })
end
```

The self-registering pattern means PEP screening appears automatically in the OSINT toolbox UI at `/osint/toolbox/global/pep-screening`, complete with dynamically generated input forms and result display. The Prismatic Academy includes a dedicated PEP screening module covering FATF guidelines, Czech AML Act compliance, and practical screening workflows.

## Cross-References

- **Sanctions** - International restrictive measures often overlapping with PEP databases
- **SDN List** - OFAC Specially Designated Nationals list used alongside PEP screening
- [PII](/glossary/pii/) - Personally identifiable information processed during PEP screening
- **Self-Registration** - Metaprogramming pattern used to expose PEP tools in the OSINT toolbox
- **Provenance** - Origin tracing required for PEP screening audit trails

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
