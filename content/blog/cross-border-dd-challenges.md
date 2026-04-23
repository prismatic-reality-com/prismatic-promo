+++
title = "Cross-Border Due Diligence: Multi-Jurisdiction Challenges"
date = 2026-03-12
description = "Navigating multi-jurisdiction DD with EU harmonization gaps, data access asymmetries, language barriers, and registry interoperability challenges"

[extra]
author = "Tomas Korcak (korczis)"
category = "deep-dive"
tags = ["cross-border", "due-diligence", "eu-regulation", "multi-jurisdiction", "compliance"]
reading_time = "11 min"
keywords = ["cross-border dd", "multi-jurisdiction", "EU harmonization", "registry interoperability", "language barriers"]
image = "/images/blog/cross-border-dd-challenges.png"
word_count = 1280
date_created = "2026-03-12"
date_modified = "2026-03-12"
quality_score = 85
see_also = ["due-diligence", "kyc", "compliance", "nis2", "entity-resolution"]
image_alt = "Cross-Border DD Challenges - Prismatic Platform"
+++

When an acquisition target has subsidiaries in Slovakia, a holding company in the Netherlands, and suppliers in Germany, due diligence must span multiple legal systems simultaneously. Despite EU harmonization efforts, significant differences in data availability, registry structure, and legal frameworks make cross-border DD substantially more complex than domestic investigations. This post examines the key challenges and how Prismatic addresses them.

## The Harmonization Gap

The EU has made progress on cross-border company information through directives like the Company Law Directive and the Business Registers Interconnection System (BRIS). In theory, BRIS connects all EU member state commercial registers through a single API. In practice, the implementation varies dramatically.

Some registries provide rich structured data including financial statements, ownership details, and corporate history. Others provide little more than a company name and registration number. Response times range from sub-second to minutes. And data freshness varies from real-time to annual updates.

Prismatic models these differences explicitly in its source adapter layer:

```elixir
defmodule Prismatic.DD.Sources.Registry do
  @moduledoc """
  Registry capability matrix for cross-border DD.
  Maps jurisdictions to available data types and quality levels.
  """

  @registry_capabilities %{
    "CZ" => %{
      financial_statements: :full,
      ownership: :full,
      beneficial_ownership: :full,
      directors: :full,
      insolvency: :full,
      data_format: :structured,
      api_access: :soap,
      typical_latency_ms: 2_000
    },
    "SK" => %{
      financial_statements: :full,
      ownership: :full,
      beneficial_ownership: :full,
      directors: :full,
      insolvency: :full,
      data_format: :structured,
      api_access: :rest,
      typical_latency_ms: 3_000
    },
    "DE" => %{
      financial_statements: :limited,
      ownership: :partial,
      beneficial_ownership: :partial,
      directors: :full,
      insolvency: :full,
      data_format: :mixed,
      api_access: :web_scraping,
      typical_latency_ms: 5_000
    },
    "NL" => %{
      financial_statements: :full,
      ownership: :full,
      beneficial_ownership: :full,
      directors: :full,
      insolvency: :partial,
      data_format: :structured,
      api_access: :rest,
      typical_latency_ms: 1_500
    },
    "CY" => %{
      financial_statements: :limited,
      ownership: :partial,
      beneficial_ownership: :limited,
      directors: :full,
      insolvency: :limited,
      data_format: :unstructured,
      api_access: :web_scraping,
      typical_latency_ms: 10_000
    }
  }

  @spec capabilities(country_code :: binary()) :: map()
  def capabilities(country_code) do
    Map.get(@registry_capabilities, country_code, %{
      financial_statements: :unknown,
      ownership: :unknown,
      beneficial_ownership: :unknown,
      directors: :unknown,
      insolvency: :unknown,
      data_format: :unknown,
      api_access: :none,
      typical_latency_ms: 30_000
    })
  end

  @spec data_quality_score(country_code :: binary()) :: float()
  def data_quality_score(country_code) do
    caps = capabilities(country_code)

    fields = [:financial_statements, :ownership, :beneficial_ownership, :directors, :insolvency]

    field_scores =
      Enum.map(fields, fn field ->
        case Map.get(caps, field) do
          :full -> 1.0
          :partial -> 0.6
          :limited -> 0.3
          _ -> 0.0
        end
      end)

    Enum.sum(field_scores) / length(fields)
  end
end
```

This capability matrix drives two critical decisions: which sources to query for a given entity jurisdiction, and how to set confidence levels on the resulting data. An ownership chain that passes through Cyprus receives lower confidence scoring than one entirely within the Czech Republic, reflecting the data quality asymmetry.

## Data Access Asymmetries

The most frustrating aspect of cross-border DD is the inconsistency in what data is publicly available across jurisdictions. Czech financial statements are freely accessible through the commercial register. German Handelsregister makes basic company data available but financial statements require paid access through the Bundesanzeiger. UK Companies House provides comprehensive free data through a well-documented API. And many offshore jurisdictions provide almost nothing.

Prismatic handles this through a tiered source strategy:

```elixir
defmodule Prismatic.DD.CrossBorder.Strategy do
  @moduledoc """
  Adaptive source selection for cross-border investigations.
  """

  @spec select_sources(entity :: map()) :: [module()]
  def select_sources(%{jurisdiction: jurisdiction} = entity) do
    base_sources = jurisdiction_sources(jurisdiction)
    supplementary = supplementary_sources(entity, base_sources)
    global = global_sources()

    (base_sources ++ supplementary ++ global)
    |> Enum.uniq()
    |> Enum.sort_by(& &1.priority())
  end

  defp jurisdiction_sources("CZ") do
    [
      Prismatic.DD.Sources.CzechCommercialRegister,
      Prismatic.DD.Sources.CzechUBO,
      Prismatic.DD.Sources.ISIR,
      Prismatic.DD.Sources.CzechTaxReliability,
      Prismatic.DD.Sources.ARES
    ]
  end

  defp jurisdiction_sources("SK") do
    [
      Prismatic.DD.Sources.SlovakCommercialRegister,
      Prismatic.DD.Sources.SlovakUBO,
      Prismatic.DD.Sources.SlovakInsolvency
    ]
  end

  defp jurisdiction_sources(_other) do
    [Prismatic.DD.Sources.OpenCorporates]
  end

  defp global_sources do
    [
      Prismatic.DD.Sources.SanctionsConsolidated,
      Prismatic.DD.Sources.PEPDatabase,
      Prismatic.DD.Sources.AdverseMedia,
      Prismatic.DD.Sources.WorldBankDebarment
    ]
  end
end
```

When primary registry data is unavailable, Prismatic falls back to commercial data providers and open data aggregators. The confidence scoring reflects this fallback: commercial register data receives confidence 0.95, while aggregated open data receives 0.60 to 0.75 depending on the provider.

## Language Barriers and Entity Name Normalization

Entity names across jurisdictions use different scripts, character sets, legal form abbreviations, and transliteration conventions. A Czech company "Acme s.r.o." might appear as "Acme GmbH" in its German subsidiary registration or "Acme Ltd" in its UK branch filing. Legal form equivalences must be mapped:

```elixir
defmodule Prismatic.DD.CrossBorder.NameNormalizer do
  @moduledoc """
  Cross-jurisdiction entity name normalization.
  Handles legal form equivalences and transliteration.
  """

  @legal_form_equivalences %{
    limited_liability: [
      "s.r.o.", "spol. s r.o.", "GmbH", "Ltd", "Ltd.", "B.V.", "S.à r.l.",
      "S.R.L.", "Sp. z o.o.", "Kft.", "LLC"
    ],
    joint_stock: [
      "a.s.", "AG", "PLC", "N.V.", "S.A.", "A.G.", "S.p.A.", "Rt.", "Corp."
    ],
    partnership: [
      "v.o.s.", "k.s.", "OHG", "KG", "LLP", "v.o.f.", "SNC"
    ]
  }

  @spec normalize_for_matching(name :: binary()) :: binary()
  def normalize_for_matching(name) do
    name
    |> String.downcase()
    |> remove_legal_form()
    |> transliterate_diacritics()
    |> String.replace(~r/[^a-z0-9\s]/, "")
    |> String.replace(~r/\s+/, " ")
    |> String.trim()
  end

  defp remove_legal_form(name) do
    all_forms =
      @legal_form_equivalences
      |> Map.values()
      |> List.flatten()
      |> Enum.sort_by(&String.length/1, :desc)

    Enum.reduce(all_forms, name, fn form, acc ->
      escaped = Regex.escape(String.downcase(form))
      String.replace(acc, ~r/\s*#{escaped}\s*/i, " ")
    end)
  end

  defp transliterate_diacritics(text) do
    text
    |> String.normalize(:nfd)
    |> String.replace(~r/[\x{0300}-\x{036f}]/, "")
  end
end
```

This normalization is essential for entity resolution across registries. Without it, the same legal entity would appear as multiple unrelated entities in the DD results, fragmenting the investigation.

## Confidence Aggregation Across Jurisdictions

When an ownership chain spans multiple jurisdictions with different data quality levels, the overall confidence must reflect the weakest link. Prismatic uses a chain confidence model where the confidence of an ownership path is the product of individual edge confidences:

If the Czech-to-Slovak ownership edge has confidence 0.95 and the Slovak-to-Cyprus edge has confidence 0.50, the chain confidence is 0.475. This multiplicative approach ensures that data quality gaps in any part of the chain are properly reflected in the final assessment.

## Regulatory Considerations

Cross-border DD must also navigate different regulatory frameworks for data access. GDPR applies uniformly but member state implementations differ. Some jurisdictions restrict bulk data access even from public registers. Others require registration or licensing to access certain datasets programmatically.

Prismatic maintains a compliance matrix per jurisdiction, ensuring that data access patterns comply with local regulations. Rate limits are set conservatively for jurisdictions with restrictive access policies, and all data access is logged for audit purposes.

The practical impact of these challenges is significant. A purely domestic Czech DD might complete in 5 to 10 seconds. A cross-border investigation spanning 4 jurisdictions typically takes 30 to 60 seconds, bounded by the slowest registry and the need for multi-stage entity resolution. But compared to the manual alternative of days or weeks, this represents a transformative improvement in efficiency.
