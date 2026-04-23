+++
title = "Verejne zakazky"
weight = 17
[extra]
icon = "document-text"
color = "blue"
category = "czech"
type = "company"
module = "VerejneZakazky"
source_type = "registry"
description = "Czech Public Procurement portal - tenders, bids, contract awards, and procurement analytics"
has_api = true
url = "https://www.vestnikverejnychzakazek.cz"
rate_limit = "Open data, no official rate limit"
capabilities = ["Tender Search", "Contract Award Tracking", "Bidder Analysis", "Procurement Statistics", "ICO-Based Lookup", "Historical Procurement Data"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1439
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Verejne", "zakazky", "Czech", "Public", "Procurement", "osint", "Prismatic Platform", "Public Procurement"]
tags = ["osint", "czech", "verejne-zakazky", "prismatic"]
quality_score = 77
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Verejne zakazky - Prismatic Platform"
+++

## Overview

Vestnik verejnych zakazek (VVZ -- Public Procurement Bulletin) is the official Czech public procurement portal operated by the Ministry for Regional Development under the legal framework of Act No. 134/2016 Sb. on Public Procurement. The portal serves as the mandatory publication venue for all public procurement notices required by Czech law and EU procurement directives, covering the complete lifecycle of public procurement from initial tender announcements through qualification requirements, bid submissions, evaluation decisions, contract awards, and post-award modifications.

For [OSINT](@/glossary/osint.md) analysts, the Czech public procurement portal represents one of the most intelligence-rich open data sources in the Czech Republic. Unlike most business intelligence sources that provide static snapshots of company profiles, procurement data reveals dynamic competitive interactions: which companies compete against each other, how they price their offerings, who wins and who loses, and how government agencies make purchasing decisions. This behavioral intelligence is invaluable for competitive analysis, due diligence, corruption detection, and market mapping.

The portal publishes notices for all procurement procedures conducted by contracting authorities covered by the Public Procurement Act, including state agencies, municipalities, state-owned enterprises, and entities receiving public funding for specific projects. Above-threshold procurements are simultaneously published in the EU's Tenders Electronic Daily (TED) system, enabling cross-border procurement intelligence for above-threshold contracts. Below-threshold procurements are published only on the national portal, making it the exclusive source for a significant volume of Czech government purchasing activity.

The procurement data ecosystem in the Czech Republic is further enriched by integration with the Registr smluv (Contract Registry), where resulting contracts above CZK 50,000 are published, and with CEDR (Central Register of Subsidies), where public funding connected to procurement is tracked. Together with analytical platforms like Hlidac statu, these interconnected registries enable comprehensive tracking of public money flows from budget allocation through procurement to contract execution.

## Data Sources and Coverage

The VVZ portal aggregates procurement data from multiple sources and covers the full procurement lifecycle:

| Lifecycle Stage | Data Published | Intelligence Value |
|----------------|---------------|-------------------|
| **Tender Notice** | Procurement object, estimated value, deadlines, qualification criteria | Market opportunity identification, competitor awareness |
| **Qualification Phase** | Required certifications, financial thresholds, experience requirements | Barrier analysis, eligible supplier mapping |
| **Bid Submission** | Bidding companies, submitted prices, technical proposals (summary) | Competitive pricing intelligence, market participant identification |
| **Evaluation** | Evaluation criteria scores, ranking, evaluation committee report | Evaluation methodology, competitive positioning |
| **Contract Award** | Winner identification, award price, contract duration | Win/loss analysis, pricing benchmarks |
| **Contract Modification** | Amendments, price changes, scope modifications, extensions | Contract execution patterns, scope creep indicators |
| **Cancellation** | Cancellation notices with stated reasons | Procurement integrity indicators, market withdrawal |

### Data Fields per Procurement Notice

| Category | Fields | Analytical Use |
|----------|--------|---------------|
| **Contracting Authority** | Name, ICO, address, contact person, procurement department | Client identification, relationship mapping |
| **Procurement Object** | Title, CPV codes, description, estimated value, duration | Market segmentation, demand analysis |
| **Procedure Type** | Open, restricted, negotiated, competitive dialogue, innovation partnership | Procurement transparency assessment |
| **Qualification Requirements** | Financial capacity, technical capability, professional experience | Market access barriers, supplier qualification |
| **Evaluation Criteria** | Price weight, quality criteria, scoring methodology | Procurement strategy intelligence |
| **Bidders** | Company names, ICO numbers, submitted prices, evaluation scores | Competitive intelligence, pricing analysis |
| **Award Decision** | Winner, contract price, award date, contract period | Market outcome intelligence |
| **CPV Codes** | Common Procurement Vocabulary classification | Sector-specific procurement mapping |

## API Integration and Data Access

The VVZ portal provides open data through XML feeds and structured data export services. Additional access is available through the Czech National Open Data Catalogue (data.gov.cz) and the ISVZ (Information System for Public Procurement).

```elixir
defmodule Prismatic.Osint.VerejneZakazky do
  @moduledoc """
  Czech Public Procurement portal OSINT adapter.

  Provides structured access to public procurement data including
  tenders, bids, contract awards, and procurement analytics. Implements
  both XML feed parsing and structured data extraction.
  """

  @base_url "https://www.vestnikverejnychzakazek.cz"
  @opendata_url "https://data.gov.cz"

  @doc """
  Search for procurement notices matching query criteria.
  Supports full-text search and structured filtering.
  """
  @spec search(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def search(query, opts \\ []) do
    cpv = Keyword.get(opts, :cpv, nil)
    since = Keyword.get(opts, :since, Date.add(Date.utc_today(), -365))
    status = Keyword.get(opts, :status, :all)

    with {:ok, results} <- execute_search(query, cpv: cpv, since: since, status: status),
         parsed <- Enum.map(results, &parse_procurement_notice/1) do
      {:ok, %{
        query: query,
        total: length(parsed),
        notices: parsed,
        source: :verejne_zakazky,
        collected_at: DateTime.utc_now()
      }}
    end
  end

  @doc """
  Retrieve all procurement activity for a specific supplier (by ICO).
  Returns bid history, win/loss record, and pricing patterns.
  """
  @spec by_supplier(keyword()) :: {:ok, map()} | {:error, term()}
  def by_supplier(opts) do
    ico = Keyword.fetch!(opts, :ico)
    since = Keyword.get(opts, :since, ~D[2016-01-01])

    with {:ok, bids} <- fetch_supplier_bids(ico, since),
         {:ok, awards} <- fetch_supplier_awards(ico, since) do
      {:ok, %{
        ico: ico,
        total_bids: length(bids),
        total_wins: length(awards),
        win_rate: safe_division(length(awards), length(bids)),
        total_awarded_value: sum_values(awards),
        average_award_value: average_value(awards),
        contracting_authorities: extract_unique_authorities(bids ++ awards),
        cpv_distribution: analyze_cpv_distribution(bids ++ awards),
        pricing_patterns: analyze_pricing(bids),
        source: :verejne_zakazky,
        collected_at: DateTime.utc_now()
      }}
    end
  end

  @doc """
  Retrieve procurement history for a specific contracting authority.
  Returns tender patterns, supplier base, and spending analytics.
  """
  @spec by_authority(keyword()) :: {:ok, map()} | {:error, term()}
  def by_authority(opts) do
    ico = Keyword.fetch!(opts, :ico)
    since = Keyword.get(opts, :since, ~D[2016-01-01])

    with {:ok, tenders} <- fetch_authority_tenders(ico, since) do
      {:ok, %{
        authority_ico: ico,
        total_tenders: length(tenders),
        total_value: sum_estimated_values(tenders),
        procedure_types: analyze_procedure_types(tenders),
        top_suppliers: extract_top_suppliers(tenders),
        cpv_profile: analyze_cpv_distribution(tenders),
        cancellation_rate: calculate_cancellation_rate(tenders),
        average_bidder_count: calculate_average_bidders(tenders),
        source: :verejne_zakazky,
        collected_at: DateTime.utc_now()
      }}
    end
  end

  @doc """
  Analyze competitive dynamics between bidders in specific CPV sectors.
  Returns head-to-head competition data and pricing comparisons.
  """
  @spec competitive_analysis(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def competitive_analysis(cpv_code, opts \\ []) do
    since = Keyword.get(opts, :since, ~D[2020-01-01])

    with {:ok, procurements} <- fetch_by_cpv(cpv_code, since) do
      {:ok, %{
        cpv_code: cpv_code,
        total_procurements: length(procurements),
        market_participants: extract_all_bidders(procurements),
        win_rate_by_company: calculate_win_rates(procurements),
        average_prices: calculate_average_prices(procurements),
        competition_intensity: calculate_avg_bidder_count(procurements),
        price_dispersion: calculate_price_variance(procurements),
        source: :verejne_zakazky,
        collected_at: DateTime.utc_now()
      }}
    end
  end

  defp safe_division(_numerator, 0), do: 0.0
  defp safe_division(numerator, denominator), do: numerator / denominator
end
```

## Query Examples

Practical procurement intelligence collection scenarios:

```elixir
# Search for cybersecurity procurement opportunities
{:ok, tenders} = Prismatic.Osint.VerejneZakazky.search("kyberneticka bezpecnost",
  status: :open,
  since: ~D[2025-01-01]
)
IO.puts("Open cybersecurity tenders: #{tenders.total}")

# Analyze a company's procurement track record
{:ok, supplier} = Prismatic.Osint.VerejneZakazky.by_supplier(ico: "25672541")
IO.puts("Total bids: #{supplier.total_bids}")
IO.puts("Win rate: #{Float.round(supplier.win_rate * 100, 1)}%")
IO.puts("Total awarded value: CZK #{supplier.total_awarded_value}")

# Profile a contracting authority's procurement behavior
{:ok, authority} = Prismatic.Osint.VerejneZakazky.by_authority(ico: "00006947")
IO.puts("Total tenders: #{authority.total_tenders}")
IO.puts("Average bidders: #{authority.average_bidder_count}")
IO.puts("Cancellation rate: #{authority.cancellation_rate}")

# Competitive landscape analysis for IT services
{:ok, analysis} = Prismatic.Osint.VerejneZakazky.competitive_analysis("72000000",
  since: ~D[2023-01-01]
)
IO.puts("Market participants: #{length(analysis.market_participants)}")
IO.puts("Average competition: #{analysis.competition_intensity} bidders")

# Cross-reference with Hlidac statu for enriched procurement intelligence
{:ok, vz_data} = Prismatic.Osint.VerejneZakazky.by_supplier(ico: "12345678")
{:ok, hs_data} = Prismatic.Osint.HlidacStatu.company("12345678")
{:ok, uohs_data} = Prismatic.Osint.Uohs.procurement_reviews("12345678")

procurement_risk = %{
  entity_ico: "12345678",
  procurement_win_rate: vz_data.win_rate,
  total_awarded_value: vz_data.total_awarded_value,
  hlidac_risk_rating: hs_data.risk_rating,
  uohs_procurement_violations: length(uohs_data),
  political_connections: length(hs_data.political_connections),
  risk_score: calculate_procurement_risk(vz_data, hs_data, uohs_data)
}
```

## Use Cases

### Competitive Intelligence and Bid Strategy

Public procurement data provides detailed competitive intelligence that is rarely available in private sector markets. Analysts can examine actual bid prices submitted by competitors, track win/loss records across multiple procurement procedures, identify which companies compete in the same sectors, understand how competitors position themselves on price versus quality criteria, and assess how procurement evaluation methodologies favor different types of bidders.

This intelligence directly supports bid strategy development for companies competing in government markets. Understanding competitor pricing patterns, typical bid-to-award ratios, and evaluation criteria preferences enables more competitive bid preparation.

### Due Diligence on Government Revenue Dependency

For due diligence on companies that derive significant revenue from public procurement, the portal reveals the concentration of government revenue (how dependent a company is on specific contracting authorities), the stability of revenue streams (whether win rates are trending up or down), pricing patterns that may indicate unsustainably aggressive bidding, and the breadth of the company's government client base.

Companies heavily dependent on a small number of government clients face concentration risk that should be factored into investment and partnership decisions.

### Procurement Integrity and Corruption Detection

Statistical analysis of procurement data can reveal indicators of potential procurement fraud or corruption, including unusually high win rates for specific companies with specific contracting authorities, pricing patterns suggesting bid coordination (nearly identical prices, systematic price rotation), disproportionate use of non-competitive procurement procedures, frequent contract modifications that significantly increase post-award values, and systematic exclusion of qualified bidders through discriminatory qualification criteria.

The Prismatic Platform applies statistical anomaly detection to procurement data, flagging patterns that warrant further investigation. These flags are cross-referenced with [UOHS](@/osint/uohs.md) procurement review decisions and [Hlidac statu](@/osint/hlidac-statu.md) risk ratings for corroborating evidence.

### Market Sizing and Demand Forecasting

Procurement data provides concrete market sizing intelligence for government-facing sectors. By analyzing tender volumes, estimated values, and CPV code distribution over time, analysts can estimate the total addressable market in specific government procurement categories, identify growing and shrinking demand sectors, forecast future procurement opportunities based on historical patterns, and assess seasonal procurement cycles.

### Supply Chain Intelligence

For critical infrastructure and defense procurement, supplier analysis reveals the government's supply chain dependencies. Identifying single-source suppliers, assessing supplier concentration in critical categories, and tracking supplier financial health through procurement revenue trends all contribute to supply chain risk assessment.

## Limitations and Constraints

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Below-threshold not always published** | Smallest procurements may not appear | Combine with Registr smluv for contract-level data |
| **Bid price data inconsistently available** | Some procedures publish only winner, not all bids | Use available data, note coverage gaps |
| **Historical data completeness** | Electronic publication improved over time, older data less complete | Focus analysis on post-2016 data (current Act) |
| **CPV code accuracy** | Contracting authorities may misclassify procurement objects | Cross-validate with procurement descriptions |
| **Redacted bid details** | Some evaluation details may be restricted | Use available summary data, request details through FOI |
| **XML feed complexity** | Data feeds use complex XML schemas requiring specialized parsing | Prismatic adapter handles schema mapping |

## Legal and Ethical Considerations

Czech public procurement data is published as open data under the Public Procurement Act and the Czech government's open data policy. The data is intended for public scrutiny to ensure transparency and accountability in government spending. There are no legal restrictions on accessing, analyzing, or republishing procurement data published through the VVZ portal.

The Prismatic Platform processes procurement data in compliance with the purpose of public procurement transparency. Individual bidder information is processed as business data submitted voluntarily through participation in public procurement procedures, which is a matter of public record. Analysis of procurement patterns for integrity assessment serves the public interest in government accountability.

When conducting procurement fraud detection analysis, the Prismatic Platform clearly distinguishes between statistical indicators (patterns that may warrant investigation) and confirmed findings (decisions by UOHS or courts). Statistical anomalies are presented as analytical indicators, not accusations.

## Platform Integration

Public procurement data is a core component of the Prismatic Platform's Czech business intelligence pipeline, feeding into entity risk assessment, competitive intelligence, and government transparency monitoring.

```elixir
defmodule Prismatic.Pipeline.ProcurementIntelligence do
  @moduledoc """
  Procurement intelligence pipeline combining VVZ data with
  Hlidac statu analytics, UOHS decisions, and ARES registry
  data for comprehensive procurement analysis.
  """

  def assess_procurement_risk(ico) do
    tasks = [
      Task.async(fn -> Prismatic.Osint.VerejneZakazky.by_supplier(ico: ico) end),
      Task.async(fn -> Prismatic.Osint.HlidacStatu.company(ico) end),
      Task.async(fn -> Prismatic.Osint.Uohs.procurement_reviews(ico) end),
      Task.async(fn -> Prismatic.Osint.Ares.lookup(ico) end)
    ]

    [vz, hs, uohs, ares] = Task.await_many(tasks, :timer.seconds(30))

    %{
      ico: ico,
      entity_name: extract_name(ares),
      procurement_profile: summarize_procurement(vz),
      risk_rating: extract_risk(hs),
      regulatory_history: summarize_regulatory(uohs),
      composite_risk: calculate_composite_procurement_risk(vz, hs, uohs),
      anomaly_indicators: detect_anomalies(vz, hs)
    }
  end
end
```

## Best Practices

For effective procurement intelligence using the Czech VVZ portal, start analysis with CPV code segmentation to focus on relevant procurement categories rather than attempting to analyze the entire procurement landscape. Use ICO-based lookups for precise entity matching, as company names may vary across procurement notices.

Cross-reference procurement data with [Registr smluv](@/osint/registr-smluv.md) to track the complete lifecycle from tender through contract execution, including any post-award modifications that may significantly change the economic terms. Combine with [Hlidac statu](@/osint/hlidac-statu.md) analytics for pre-computed risk assessments and political connection mapping of procurement participants.

For procurement integrity analysis, establish statistical baselines before flagging anomalies. Win rates, price dispersion, and competitive intensity vary significantly across procurement categories and should be assessed relative to sector-specific norms rather than universal thresholds. Track anomaly indicators over time to distinguish persistent patterns from one-time occurrences.

## Related Sources

- [Registr smluv](@/osint/registr-smluv.md) - Contracts resulting from procurement awards
- [UOHS](@/osint/uohs.md) - Competition authority reviewing procurement irregularities
- [Hlidac statu](@/osint/hlidac-statu.md) - Government watchdog with procurement analytics and risk ratings
- [ARES](@/osint/ares.md) - Czech business [registry](@/glossary/registry-otp.md) for bidder identification
- [CEDR](@/osint/cedr.md) - Central Register of Subsidies for public funding context
- [Justice.cz](@/osint/justice-cz.md) - Commercial Register for company ownership verification
- [Databaze firem](@/osint/databaze-firem.md) - Business directory for supplementary company data

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)