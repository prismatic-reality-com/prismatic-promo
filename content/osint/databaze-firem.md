+++
title = "Databaze firem"
weight = 53
[extra]
category = "czech"
type = "company"
module = "DatabazeFirem"
description = "Czech business directory with company profiles, contacts, and financial data"
has_api = false
url = "https://www.databazeknih.cz"
rate_limit = "Web interface, no official API"
capabilities = ["Company Search", "Contact Information", "Financial Summaries", "Industry Classification", "Business Relationships", "Regional Analysis"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1321
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Databaze", "firem", "Czech", "osint", "Prismatic Platform", "ARES", "Justice"]
tags = ["osint", "czech", "databaze-firem", "prismatic"]
quality_score = 74
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Databaze firem - Prismatic Platform"
+++

## Overview

Databaze firem is a comprehensive Czech business directory that aggregates company information from official government registries, commercial databases, and publicly available sources into a unified searchable platform. It provides detailed profiles of Czech businesses including contact details, industry classification codes, financial summaries, organizational structure, and inter-company relationships. The platform serves as one of the most widely used commercial business directories in the Czech Republic, functioning as an aggregation layer that combines data points that would otherwise require querying multiple separate registries.

For [OSINT](/glossary/osint/) analysts, Databaze firem occupies an important niche in the Czech intelligence collection ecosystem. While it is not an authoritative primary source like ARES or Justice.cz, its value lies in the consolidation of data from multiple registries into a single searchable interface, the inclusion of commercial contact information not available in government registries, and its structured presentation of inter-company relationships and group structures. It is particularly useful for rapid initial reconnaissance before deeper investigation through authoritative sources.

The platform indexes hundreds of thousands of Czech business entities, ranging from sole proprietors to multinational subsidiaries. Its data is refreshed from source registries on a regular basis, though the exact update frequency varies by data type and source. Understanding the provenance and freshness of data within Databaze firem is essential for analysts who need to make reliability assessments about the intelligence they extract.

## Data Sources and Coverage

Databaze firem aggregates data from multiple upstream sources, each contributing different types of intelligence:

| Source | Data Contributed | Refresh Rate | Reliability |
|--------|-----------------|--------------|-------------|
| **ARES** | ICO, DIC, legal form, registered address, business activities | Daily | High -- authoritative government source |
| **Justice.cz** | Directors, board members, statutory representatives, ownership | Weekly | High -- official commercial register |
| **RZP** | Trade licenses, business scope, licensed activities | Weekly | High -- trade licensing register |
| **CZSO** | CZ-NACE codes, industry classification, statistical data | Monthly | High -- national statistical office |
| **Commercial Sources** | Phone numbers, email addresses, websites, social media | Variable | Medium -- user-submitted and scraped |
| **Financial Databases** | Revenue ranges, employee count estimates, turnover data | Annually | Medium -- estimated from available data |

### Data Points Available

| Data Category | Specific Fields | Intelligence Value |
|---------------|----------------|-------------------|
| **Company Identity** | Name, ICO, DIC, legal form, date of incorporation | Entity identification and verification |
| **Registered Address** | Street, city, postal code, region | Geographic intelligence, address correlation |
| **Contact Information** | Phone, fax, email, website URL, social media | Communication channels, digital footprint |
| **Financial Indicators** | Revenue range, employee count band, turnover estimate | Economic profiling, company sizing |
| **Industry Classification** | CZ-NACE primary and secondary codes, business descriptions | Sector analysis, competitive mapping |
| **Management** | Directors, executives, statutory representatives | Person-entity linking, network analysis |
| **Related Entities** | Subsidiaries, parent companies, branches, affiliated entities | Corporate group mapping |
| **Business Activities** | Licensed activities, trade descriptions, sector memberships | Capability assessment, scope of operations |

## API Integration and Data Collection

Databaze firem does not provide an official public API. The Prismatic Platform adapter implements structured data extraction from the web interface, with appropriate rate limiting and data validation. All collection respects the platform's terms of service and robots.txt directives.

```elixir
defmodule Prismatic.Osint.DatabazeFirem do
  @moduledoc """
  Databaze firem OSINT adapter for Czech business directory intelligence.

  Provides structured access to aggregated Czech business data including
  company profiles, contact information, financial indicators, and
  inter-company relationships.

  Note: This is a supplementary source. Always cross-reference with
  authoritative registries (ARES, Justice.cz) for verification.
  """

  @base_url "https://www.databazeknih.cz"

  @doc """
  Search for companies by name, returning structured results with
  key business identifiers.
  """
  @spec search(String.t(), keyword()) :: {:ok, [map()]} | {:error, term()}
  def search(query, opts \\ []) do
    limit = Keyword.get(opts, :limit, 25)
    region = Keyword.get(opts, :region, :all)

    with {:ok, response} <- execute_search(query, limit: limit, region: region),
         {:ok, results} <- parse_search_results(response) do
      {:ok, Enum.map(results, &enrich_result/1)}
    end
  end

  @doc """
  Retrieve detailed company profile by ICO.
  Returns comprehensive profile with all available data points.
  """
  @spec detail(keyword()) :: {:ok, map()} | {:error, :not_found | term()}
  def detail(opts) do
    ico = Keyword.fetch!(opts, :ico)

    with {:ok, response} <- fetch_company_page(ico),
         {:ok, profile} <- parse_company_profile(response) do
      {:ok, %{
        source: :databaze_firem,
        reliability: :medium,
        collected_at: DateTime.utc_now(),
        profile: profile
      }}
    end
  end

  @doc """
  Search for companies by CZ-NACE industry classification code.
  Returns entities operating in the specified industry sector.
  """
  @spec by_nace(String.t(), keyword()) :: {:ok, [map()]} | {:error, term()}
  def by_nace(nace_code, opts \\ []) do
    region = Keyword.get(opts, :region, :all)
    limit = Keyword.get(opts, :limit, 100)

    with {:ok, response} <- fetch_nace_listing(nace_code, region: region, limit: limit),
         {:ok, companies} <- parse_nace_results(response) do
      {:ok, companies}
    end
  end

  @doc """
  Retrieve related entities for a given company.
  Maps subsidiaries, parent companies, and affiliated entities.
  """
  @spec related_entities(String.t()) :: {:ok, [map()]} | {:error, term()}
  def related_entities(ico) do
    with {:ok, profile} <- detail(ico: ico),
         {:ok, relations} <- extract_relationships(profile) do
      {:ok, relations}
    end
  end
end
```

### Cross-Registry Validation Pattern

Because Databaze firem is an aggregator rather than an authoritative source, the Prismatic Platform implements a mandatory validation pattern:

```elixir
defmodule Prismatic.Pipeline.CzechEntityValidation do
  @moduledoc """
  Validates Databaze firem data against authoritative Czech registries.
  Implements the NABLA signal plurality axiom requiring multiple
  independent sources for belief establishment.
  """

  @doc """
  Validate a company profile from Databaze firem against ARES and Justice.cz.
  Returns a validated profile with confidence scores per field.
  """
  @spec validate_profile(String.t()) :: {:ok, map()} | {:error, term()}
  def validate_profile(ico) do
    with {:ok, df_profile} <- Prismatic.Osint.DatabazeFirem.detail(ico: ico),
         {:ok, ares_record} <- Prismatic.Osint.Ares.lookup(ico),
         {:ok, justice_record} <- Prismatic.Osint.JusticeCz.lookup(ico) do
      {:ok, %{
        validated_name: ares_record.name,
        validated_address: ares_record.address,
        validated_status: ares_record.status,
        contact_info: df_profile.profile.contact,
        contact_confidence: :medium,
        financial_indicators: df_profile.profile.financial,
        financial_confidence: :low,
        management: justice_record.directors,
        management_confidence: :high,
        sources: [:databaze_firem, :ares, :justice_cz],
        validated_at: DateTime.utc_now()
      }}
    end
  end
end
```

## Query Examples

Practical intelligence collection patterns using the Databaze firem adapter:

```elixir
# Basic company search with regional filtering
{:ok, results} = Prismatic.Osint.DatabazeFirem.search("software",
  region: :praha,
  limit: 50
)

# Detailed company profile retrieval
{:ok, company} = Prismatic.Osint.DatabazeFirem.detail(ico: "12345678")

# Industry sector mapping -- all IT companies in South Moravia
{:ok, it_companies} = Prismatic.Osint.DatabazeFirem.by_nace("62.01",
  region: :jihomoravsky_kraj,
  limit: 500
)

# Corporate group structure mapping
{:ok, group} = Prismatic.Osint.DatabazeFirem.related_entities("25672541")

# Multi-source enrichment pipeline
{:ok, df_data} = Prismatic.Osint.DatabazeFirem.detail(ico: "12345678")
{:ok, ares_data} = Prismatic.Osint.Ares.lookup("12345678")
{:ok, hs_data} = Prismatic.Osint.HlidacStatu.company("12345678")

enriched_profile = %{
  identity: ares_data,
  contacts: df_data.profile.contact,
  government_risk: hs_data.risk_rating,
  industries: df_data.profile.nace_codes,
  source_count: 3,
  confidence: :high
}
```

## Use Cases

### Rapid Business Intelligence Reconnaissance

Databaze firem excels as a starting point for business intelligence investigations on Czech entities. When an analyst receives a company name or ICO and needs to quickly understand the entity's profile, the directory provides a consolidated view that saves significant time compared to querying individual registries. The contact information -- phone numbers, email addresses, and website URLs -- is often the most valuable unique contribution, as this data is typically not available through government registries.

For competitive intelligence, the CZ-NACE classification enables rapid mapping of industry landscapes. An analyst can query all entities registered under a specific activity code within a geographic region to understand market structure, identify competitors, and assess market density.

### Due Diligence Screening

While not sufficient as a sole source for due diligence, Databaze firem provides an efficient initial screening layer. The directory's aggregated view allows analysts to quickly assess whether a company appears legitimate based on consistency of data across sources, presence of contact information, alignment between registered and actual business activities, and existence of related entities and group structures.

Discrepancies between Databaze firem's aggregated data and authoritative sources can themselves be intelligence signals. A company that appears differently in the commercial directory versus official registries may warrant deeper investigation.

### Market Research and Regional Analysis

The directory's structured industry classification and geographic indexing make it suitable for market research activities. Analysts can map the density of specific business types across Czech regions, identify clusters of related businesses that may indicate supply chain concentrations, track new business registrations in specific sectors, and analyze the competitive landscape for market entry assessments.

### Contact Discovery for Investigations

For OSINT investigations that require establishing contact with an entity or identifying communication channels, Databaze firem often provides phone numbers, email addresses, and website URLs that are not available through government registries. This contact data, while not always current, provides leads for further investigation and may reveal additional digital footprint elements for follow-on collection.

## Limitations and Constraints

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Not an authoritative source** | Data may contain errors or outdated information | Always validate against ARES and Justice.cz |
| **No official API** | Collection requires web scraping | Robust parser with validation, rate limiting |
| **Financial data is estimated** | Revenue and employee counts are approximations | Use only as sizing indicators, not precise figures |
| **Contact data staleness** | Phone and email may be outdated | Cross-reference with website, verify before use |
| **Inconsistent update cycles** | Different data types refresh at different rates | Timestamp all collected data, note provenance |
| **Commercial bias** | Paying entities may have enhanced profiles | Weight data by source provenance, not presentation |

## Legal and Ethical Considerations

Collection from Databaze firem operates within the framework of publicly accessible business information. Czech law establishes that business registration data held in public registries is accessible to anyone, and commercial directories that aggregate this public data inherit this accessibility. However, several legal and ethical considerations apply to systematic collection.

Contact information, particularly phone numbers and email addresses of individuals, may be subject to GDPR protections. The Prismatic Platform processes such data only where there is a legitimate interest basis, such as due diligence or security investigation, and implements appropriate data minimization and retention policies.

Web scraping activities comply with the platform's robots.txt directives and rate limitations. The adapter implements adaptive rate limiting to avoid placing excessive load on the service. Collected data is stored with full provenance tracking, enabling audit of collection activities and compliance with data subject access requests.

## Platform Integration

Within the Prismatic Platform, Databaze firem serves as a supplementary enrichment source in the Czech entity intelligence pipeline. It is never used as a sole source for any intelligence assessment but contributes to the multi-source validation framework required by the NABLA signal plurality axiom.

```elixir
# Integration in the Czech entity enrichment pipeline
defmodule Prismatic.Pipeline.CzechEntityEnrichment do
  @source_priority [
    {:ares, :authoritative},
    {:justice_cz, :authoritative},
    {:rzp, :authoritative},
    {:hlidac_statu, :analytics},
    {:databaze_firem, :supplementary}
  ]

  def enrich(ico) do
    Enum.reduce(@source_priority, %{ico: ico}, fn {source, tier}, acc ->
      case collect_from_source(source, ico) do
        {:ok, data} -> merge_with_priority(acc, data, tier)
        {:error, _} -> acc
      end
    end)
  end
end
```

## Best Practices

Effective use of Databaze firem in OSINT operations requires treating it as what it is: a useful aggregator and contact discovery tool, not an authoritative source. Always start queries with the ICO identifier rather than company name to avoid ambiguity. Cross-reference all findings with [ARES](/osint/ares/) for identity verification and [Justice.cz](/osint/justice-cz/) for ownership and management data. Use the financial indicators only for rough company sizing, never for precise financial analysis.

The directory's greatest unique value is in contact discovery and industry classification mapping. Prioritize these data types in collection planning and invest validation effort proportional to the intelligence value of each data point. Document the provenance of all data collected from Databaze firem, noting that it is a commercial aggregator with medium reliability.

## Related Sources

- [ARES](/osint/ares/) - Authoritative Czech business [registry](/glossary/registry-otp/) for verification
- [Justice.cz](/osint/justice-cz/) - Official commercial register with ownership data
- [RZP](/osint/rzp/) - Czech trade licensing register for activity verification
- [Open Corporates](/osint/open-corporates/) - Global company data for cross-border correlation
- [Hlidac statu](/osint/hlidac-statu/) - Government watchdog analytics and risk ratings
- [CEDR](/osint/cedr/) - Central Register of Subsidies for public funding data
- [Verejne zakazky](/osint/verejne-zakazky/) - Public procurement data for government contracts

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)